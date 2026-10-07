import { AnalyticsOverview } from '@feedbackpulse/types';

export interface IAnalyticsRepository {
  getOverview(tenantId: string): Promise<AnalyticsOverview>;
}
