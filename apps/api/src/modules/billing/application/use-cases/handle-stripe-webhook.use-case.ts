import { Inject, Injectable, Logger } from '@nestjs/common';
import { PlanTier, SubscriptionStatus } from '@feedbackpulse/types';
import { SUBSCRIPTION_REPOSITORY } from '../tokens';
import { ISubscriptionRepository } from '../ports/subscription.repository.interface';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

@Injectable()
export class HandleStripeWebhookUseCase {
  private readonly logger = new Logger(HandleStripeWebhookUseCase.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subRepo: ISubscriptionRepository,
  ) {}

  async execute(event: { type: string; data: any }): Promise<{ received: boolean }> {
    this.logger.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = session.client_reference_id || session.metadata?.tenantId;
        const plan = (session.metadata?.plan as PlanTier) || PlanTier.PRO;
        const stripeSubscriptionId = session.subscription;
        const stripeCustomerId = session.customer;

        if (tenantId) {
          const sub = SubscriptionEntity.create({
            tenantId,
            planId: plan,
            stripeSubscriptionId,
            stripeCustomerId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          });
          await this.subRepo.createOrUpdate(sub);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const existing = await this.subRepo.findByStripeSubscriptionId(subscription.id);
        if (existing) {
          const updated = new SubscriptionEntity(
            existing.id,
            existing.tenantId,
            existing.stripeSubscriptionId,
            existing.stripeCustomerId,
            PlanTier.FREE,
            SubscriptionStatus.CANCELED,
            null,
            existing.createdAt,
            new Date(),
          );
          await this.subRepo.createOrUpdate(updated);
        }
        break;
      }
    }

    return { received: true };
  }
}
