import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CreateCheckoutSessionDto } from '@feedbackpulse/types';
import { STRIPE_SERVICE } from '../tokens';
import { IStripeService } from '../ports/stripe.service.interface';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @Inject(STRIPE_SERVICE) private readonly stripeService: IStripeService,
  ) {}

  async execute(
    tenantId: string,
    customerEmail: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    return this.stripeService.createCheckoutSession({
      tenantId,
      customerEmail,
      plan: dto.plan,
      interval: dto.interval,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });
  }
}
