import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

export interface ISubscriptionRepository {
  findByTenantId(tenantId: string): Promise<SubscriptionEntity | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionEntity | null>;
  createOrUpdate(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
}
