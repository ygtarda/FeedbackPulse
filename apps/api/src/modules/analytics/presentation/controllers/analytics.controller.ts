import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { GetAnalyticsUseCase } from '../../application/use-cases/get-analytics.use-case';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly getAnalyticsUseCase: GetAnalyticsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Tenant genel kullanım analitiklerini ve özet grafikleri getir' })
  @ApiResponse({ status: 200, description: 'Analitik metrikleri' })
  async getAnalytics(@CurrentTenant() tenantId: string) {
    return this.getAnalyticsUseCase.execute(tenantId);
  }
}
