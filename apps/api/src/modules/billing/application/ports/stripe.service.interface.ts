import { PlanTier } from '@feedbackpulse/types';

export interface IStripeService {
  createCheckoutSession(params: {
    tenantId: string;
    customerEmail: string;
    plan: PlanTier;
    interval: 'month' | 'year';
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; checkoutUrl: string }>;

  createCustomerPortalSession(params: {
    stripeCustomerId: string;
    returnUrl?: string;
  }): Promise<{ portalUrl: string }>;
}
