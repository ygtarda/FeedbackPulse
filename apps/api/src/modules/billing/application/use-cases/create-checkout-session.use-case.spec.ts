import { BadRequestException } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from './create-checkout-session.use-case';
import { IStripeService } from '../ports/stripe.service.interface';
import { PlanTier } from '@feedbackpulse/types';

describe('CreateCheckoutSessionUseCase', () => {
  let useCase: CreateCheckoutSessionUseCase;
  let mockStripeService: jest.Mocked<IStripeService>;

  beforeEach(() => {
    mockStripeService = {
      createCheckoutSession: jest.fn(),
      createCustomerPortalSession: jest.fn(),
    };
    useCase = new CreateCheckoutSessionUseCase(mockStripeService);
  });

  it('should call stripe service to create checkout session', async () => {
    mockStripeService.createCheckoutSession.mockResolvedValue({
      sessionId: 'cs_123',
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_123',
    });

    const result = await useCase.execute('tenant-1', 'admin@example.com', {
      plan: PlanTier.PRO,
      interval: 'month',
    });

    expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      customerEmail: 'admin@example.com',
      plan: PlanTier.PRO,
      interval: 'month',
      successUrl: undefined,
      cancelUrl: undefined,
    });
    expect(result.sessionId).toBe('cs_123');
  });

  it('should throw BadRequestException if tenantId missing', async () => {
    await expect(
      useCase.execute('', 'admin@example.com', { plan: PlanTier.PRO, interval: 'month' }),
    ).rejects.toThrow(BadRequestException);
  });
});
