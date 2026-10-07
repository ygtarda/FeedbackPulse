import { SubscriptionStatus, PlanTier } from '@feedbackpulse/types';

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly stripeSubscriptionId: string | null,
    public readonly stripeCustomerId: string | null,
    public readonly planId: PlanTier,
    public readonly status: SubscriptionStatus,
    public readonly currentPeriodEnd: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string;
    planId: PlanTier;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    status?: SubscriptionStatus;
    currentPeriodEnd?: Date;
  }): SubscriptionEntity {
    return new SubscriptionEntity(
      '',
      props.tenantId,
      props.stripeSubscriptionId || null,
      props.stripeCustomerId || null,
      props.planId,
      props.status || SubscriptionStatus.ACTIVE,
      props.currentPeriodEnd || null,
      new Date(),
      new Date(),
    );
  }
}
