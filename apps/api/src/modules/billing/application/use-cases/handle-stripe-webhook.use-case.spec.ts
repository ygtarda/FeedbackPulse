import { HandleStripeWebhookUseCase } from './handle-stripe-webhook.use-case';
import { ISubscriptionRepository } from '../ports/subscription.repository.interface';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { PlanTier, SubscriptionStatus } from '@feedbackpulse/types';

describe('HandleStripeWebhookUseCase', () => {
  let useCase: HandleStripeWebhookUseCase;
  let mockSubRepo: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    mockSubRepo = {
      findByTenantId: jest.fn(),
      findByStripeSubscriptionId: jest.fn(),
      createOrUpdate: jest.fn(),
    };
    useCase = new HandleStripeWebhookUseCase(mockSubRepo);
  });

  it('should update subscription on checkout.session.completed', async () => {
    mockSubRepo.createOrUpdate.mockResolvedValue({} as any);

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'tenant-123',
          subscription: 'sub_123',
          customer: 'cus_123',
          metadata: { plan: PlanTier.BUSINESS },
        },
      },
    };

    const result = await useCase.execute(event);

    expect(mockSubRepo.createOrUpdate).toHaveBeenCalled();
    expect(result.received).toBe(true);
  });

  it('should downgrade subscription on customer.subscription.deleted', async () => {
    const existing = new SubscriptionEntity(
      's-1',
      'tenant-123',
      'sub_123',
      'cus_123',
      PlanTier.PRO,
      SubscriptionStatus.ACTIVE,
      new Date(),
      new Date(),
      new Date(),
    );
    mockSubRepo.findByStripeSubscriptionId.mockResolvedValue(existing);

    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
        },
      },
    };

    const result = await useCase.execute(event);

    expect(mockSubRepo.createOrUpdate).toHaveBeenCalled();
    expect(result.received).toBe(true);
  });
});
