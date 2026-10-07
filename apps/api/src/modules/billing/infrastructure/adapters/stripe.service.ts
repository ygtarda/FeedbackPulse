import { Injectable, Logger } from '@nestjs/common';
import { PlanTier } from '@feedbackpulse/types';
import { IStripeService } from '../../application/ports/stripe.service.interface';

@Injectable()
export class StripeService implements IStripeService {
  private readonly logger = new Logger(StripeService.name);

  async createCheckoutSession(params: {
    tenantId: string;
    customerEmail: string;
    plan: PlanTier;
    interval: 'month' | 'year';
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    this.logger.log(`Creating Stripe checkout session for tenant ${params.tenantId}, plan: ${params.plan}`);

    const sessionId = `cs_test_${Date.now()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutUrl = params.successUrl || `${frontendUrl}/billing?session_id=${sessionId}&success=true`;

    return {
      sessionId,
      checkoutUrl,
    };
  }

  async createCustomerPortalSession(params: {
    stripeCustomerId: string;
    returnUrl?: string;
  }): Promise<{ portalUrl: string }> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      portalUrl: params.returnUrl || `${frontendUrl}/billing`,
    };
  }
}
