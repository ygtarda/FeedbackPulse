import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PlanTier } from '@feedbackpulse/types';
import { PLAN_LIMITS_MAP } from '../../domain/plan-limits';

export const USAGE_RESOURCE_KEY = 'usage_resource_key';
export const RequiresQuota = (resource: 'board' | 'member') =>
  SetMetadata(USAGE_RESOURCE_KEY, resource);

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<'board' | 'member' | undefined>(
      USAGE_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!resource) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      return true;
    }

    // Get tenant subscription
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId },
    });

    const plan = (sub?.planId as PlanTier) || PlanTier.FREE;
    const limits = PLAN_LIMITS_MAP[plan] || PLAN_LIMITS_MAP[PlanTier.FREE];

    if (resource === 'board') {
      const currentBoards = await this.prisma.board.count({
        where: { tenantId, deletedAt: null },
      });
      if (currentBoards >= limits.maxBoards) {
        throw new ForbiddenException(
          `Mevcut planınızda (${plan}) en fazla ${limits.maxBoards} adet pano oluşturabilirsiniz. Lütfen planınızı yükseltin.`,
        );
      }
    }

    if (resource === 'member') {
      const currentMembers = await this.prisma.tenantMembership.count({
        where: { tenantId },
      });
      if (currentMembers >= limits.maxTeamMembers) {
        throw new ForbiddenException(
          `Mevcut planınızda (${plan}) en fazla ${limits.maxTeamMembers} takım üyesi ekleyebilirsiniz. Lütfen planınızı yükseltin.`,
        );
      }
    }

    return true;
  }
}
