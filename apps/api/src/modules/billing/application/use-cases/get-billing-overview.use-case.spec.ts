import { BadRequestException } from '@nestjs/common';
import { GetBillingOverviewUseCase } from './get-billing-overview.use-case';
import { ISubscriptionRepository } from '../ports/subscription.repository.interface';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { PlanTier, SubscriptionStatus } from '@feedbackpulse/types';

describe('GetBillingOverviewUseCase', () => {
  let useCase: GetBillingOverviewUseCase;
  let mockSubRepo: jest.Mocked<ISubscriptionRepository>;
  let mockPrisma: any;

  beforeEach(() => {
    mockSubRepo = {
      findByTenantId: jest.fn(),
      findByStripeSubscriptionId: jest.fn(),
      createOrUpdate: jest.fn(),
    };

    mockPrisma = {
      board: { count: jest.fn().mockResolvedValue(1) },
      tenantMembership: { count: jest.fn().mockResolvedValue(2) },
      feedback: { count: jest.fn().mockResolvedValue(15) },
    };

    useCase = new GetBillingOverviewUseCase(mockSubRepo, mockPrisma);
  });

  it('should return billing overview for tenant', async () => {
    const sub = new SubscriptionEntity(
      'sub-1',
      'tenant-1',
      'sub_stripe_1',
      'cus_1',
      PlanTier.PRO,
      SubscriptionStatus.ACTIVE,
      new Date(),
      new Date(),
      new Date(),
    );
    mockSubRepo.findByTenantId.mockResolvedValue(sub);

    const result = await useCase.execute('tenant-1');

    expect(result.currentPlan).toBe(PlanTier.PRO);
    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(result.usage.boardsCount).toBe(1);
    expect(result.usage.membersCount).toBe(2);
    expect(result.limits.maxBoards).toBe(10);
  });

  it('should fallback to FREE plan if no subscription found', async () => {
    mockSubRepo.findByTenantId.mockResolvedValue(null);

    const result = await useCase.execute('tenant-1');

    expect(result.currentPlan).toBe(PlanTier.FREE);
    expect(result.limits.maxBoards).toBe(1);
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });
});
