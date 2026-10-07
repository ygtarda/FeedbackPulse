import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { PlanTier, SubscriptionStatus, BillingOverview } from '@feedbackpulse/types';
import { SUBSCRIPTION_REPOSITORY } from '../tokens';
import { ISubscriptionRepository } from '../ports/subscription.repository.interface';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PLAN_LIMITS_MAP } from '../../domain/plan-limits';

@Injectable()
export class GetBillingOverviewUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subRepo: ISubscriptionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(tenantId: string): Promise<BillingOverview> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    const sub = await this.subRepo.findByTenantId(tenantId);
    const plan = (sub?.planId as PlanTier) || PlanTier.FREE;
    const status = (sub?.status as SubscriptionStatus) || SubscriptionStatus.ACTIVE;
    const currentPeriodEnd = sub?.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null;

    const [boardsCount, membersCount, feedbacksCount] = await Promise.all([
      this.prisma.board.count({ where: { tenantId } }),
      this.prisma.tenantMembership.count({ where: { tenantId } }),
      this.prisma.feedback.count({ where: { tenantId } }),
    ]);

    const limits = PLAN_LIMITS_MAP[plan] || PLAN_LIMITS_MAP[PlanTier.FREE];

    return {
      currentPlan: plan,
      status,
      currentPeriodEnd,
      usage: {
        boardsCount,
        membersCount,
        feedbacksCount,
      },
      limits,
    };
  }
}
