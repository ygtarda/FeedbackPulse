import { PlanTier, PlanLimits } from '@feedbackpulse/types';

export const PLAN_LIMITS_MAP: Record<PlanTier, PlanLimits> = {
  [PlanTier.FREE]: {
    maxBoards: 1,
    maxTeamMembers: 1,
    maxCustomers: 100,
    customDomain: false,
    webhooks: false,
    embedWidget: false,
  },
  [PlanTier.PRO]: {
    maxBoards: 10,
    maxTeamMembers: 3,
    maxCustomers: 2500,
    customDomain: false,
    webhooks: false,
    embedWidget: true,
  },
  [PlanTier.BUSINESS]: {
    maxBoards: 9999,
    maxTeamMembers: 9999,
    maxCustomers: 999999,
    customDomain: true,
    webhooks: true,
    embedWidget: true,
  },
};
