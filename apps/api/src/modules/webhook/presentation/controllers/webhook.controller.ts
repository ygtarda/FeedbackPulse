import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CreateWebhookEndpointDto } from '../dtos/create-webhook.dto';
import { CreateWebhookUseCase } from '../../application/use-cases/create-webhook.use-case';
import { ListWebhooksUseCase } from '../../application/use-cases/list-webhooks.use-case';
import { DeleteWebhookUseCase } from '../../application/use-cases/delete-webhook.use-case';
import { TestWebhookUseCase } from '../../application/use-cases/test-webhook.use-case';

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(
    private readonly createWebhookUseCase: CreateWebhookUseCase,
    private readonly listWebhooksUseCase: ListWebhooksUseCase,
    private readonly deleteWebhookUseCase: DeleteWebhookUseCase,
    private readonly testWebhookUseCase: TestWebhookUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Tenant için tanımlı webhook uç noktalarını listele' })
  @ApiResponse({ status: 200, description: 'Webhook listesi' })
  async list(@CurrentTenant() tenantId: string) {
    return this.listWebhooksUseCase.execute(tenantId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni webhook uç noktası kaydet (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 201, description: 'Webhook oluşturuldu' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    return this.createWebhookUseCase.execute(tenantId, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Webhook uç noktasını sil (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 204, description: 'Webhook silindi' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.deleteWebhookUseCase.execute(id, tenantId);
  }

  @Post(':id/test')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook uç noktasına test ping paketi gönder' })
  @ApiResponse({ status: 200, description: 'Test sonucu' })
  async test(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.testWebhookUseCase.execute(id, tenantId);
  }
}
