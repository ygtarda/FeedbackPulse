import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { AiSummaryUseCase } from '../../application/use-cases/ai-summary.use-case';
import { AiDuplicateCheckUseCase } from '../../application/use-cases/ai-duplicate-check.use-case';

class AiSummaryDto {
  boardId?: string;
}

class AiDuplicateCheckDto {
  title: string;
  description?: string;
}

@ApiTags('AI Assistant')
@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiSummaryUseCase: AiSummaryUseCase,
    private readonly aiDuplicateCheckUseCase: AiDuplicateCheckUseCase,
  ) {}

  @Post('summary')
  @ApiOperation({ summary: 'Geri bildirimleri yapay zeka ile sentezle ve özet çıkar' })
  @ApiResponse({ status: 200, description: 'AI Özeti ve içgörüler' })
  async getSummary(
    @CurrentTenant() tenantId: string,
    @Body() dto: AiSummaryDto,
  ) {
    return this.aiSummaryUseCase.execute(tenantId, dto.boardId);
  }

  @Post('duplicate-check')
  @ApiOperation({ summary: 'Yeni talep için olası benzer/mükerrer kayıtları tespit et' })
  @ApiResponse({ status: 200, description: 'Benzer talepler listesi' })
  async checkDuplicates(
    @CurrentTenant() tenantId: string,
    @Body() dto: AiDuplicateCheckDto,
  ) {
    return this.aiDuplicateCheckUseCase.execute(tenantId, dto.title, dto.description);
  }
}
