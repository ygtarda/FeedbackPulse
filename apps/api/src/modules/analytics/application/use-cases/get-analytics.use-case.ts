import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AnalyticsOverview } from '@feedbackpulse/types';
import { ANALYTICS_REPOSITORY } from '../tokens';
import { IAnalyticsRepository } from '../ports/analytics.repository.interface';

@Injectable()
export class GetAnalyticsUseCase {
  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepo: IAnalyticsRepository,
  ) {}

  async execute(tenantId: string): Promise<AnalyticsOverview> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID gereklidir');
    }
    return this.analyticsRepo.getOverview(tenantId);
  }
}
