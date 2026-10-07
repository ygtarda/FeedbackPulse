import { z } from 'zod';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIALING = 'TRIALING',
}

export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

export interface PlanLimits {
  maxBoards: number;
  maxTeamMembers: number;
  maxCustomers: number;
  customDomain: boolean;
  webhooks: boolean;
  embedWidget: boolean;
}

export interface PlanDetail {
  id: PlanTier;
  name: string;
  priceMonth: number;
  priceYear: number;
  description: string;
  limits: PlanLimits;
  features: string[];
}

export interface BillingOverview {
  currentPlan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  usage: {
    boardsCount: number;
    membersCount: number;
    feedbacksCount: number;
  };
  limits: PlanLimits;
}

export const CreateCheckoutSessionSchema = z.object({
  plan: z.nativeEnum(PlanTier),
  interval: z.enum(['month', 'year']).default('month'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutSessionDto = z.infer<typeof CreateCheckoutSessionSchema>;
