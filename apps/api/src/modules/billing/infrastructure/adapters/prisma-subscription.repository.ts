import { Injectable } from '@nestjs/common';
import { PlanTier, SubscriptionStatus } from '@feedbackpulse/types';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ISubscriptionRepository } from '../../application/ports/subscription.repository.interface';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): SubscriptionEntity {
    return new SubscriptionEntity(
      raw.id,
      raw.tenantId,
      raw.stripeSubscriptionId,
      raw.stripeCustomerId,
      raw.planId as PlanTier,
      raw.status as SubscriptionStatus,
      raw.currentPeriodEnd,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async findByTenantId(tenantId: string): Promise<SubscriptionEntity | null> {
    const raw = await (this.prisma as any).subscription.findFirst({
      where: { tenantId },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null> {
    const raw = await (this.prisma as any).subscription.findUnique({
      where: { stripeSubscriptionId },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async createOrUpdate(sub: SubscriptionEntity): Promise<SubscriptionEntity> {
    const existing = await (this.prisma as any).subscription.findFirst({
      where: { tenantId: sub.tenantId },
    });

    if (existing) {
      const raw = await (this.prisma as any).subscription.update({
        where: { id: existing.id },
        data: {
          planId: sub.planId,
          status: sub.status,
          stripeSubscriptionId: sub.stripeSubscriptionId || existing.stripeSubscriptionId,
          stripeCustomerId: sub.stripeCustomerId || existing.stripeCustomerId,
          currentPeriodEnd: sub.currentPeriodEnd,
        },
      });
      return this.toDomain(raw);
    }

    const raw = await (this.prisma as any).subscription.create({
      data: {
        tenantId: sub.tenantId,
        planId: sub.planId,
        status: sub.status,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        stripeCustomerId: sub.stripeCustomerId,
        currentPeriodEnd: sub.currentPeriodEnd,
      },
    });
    return this.toDomain(raw);
  }
}
