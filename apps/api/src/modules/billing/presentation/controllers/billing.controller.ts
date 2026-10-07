import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CreateCheckoutDto } from '../dtos/create-checkout.dto';
import { GetBillingOverviewUseCase } from '../../application/use-cases/get-billing-overview.use-case';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case';
import { HandleStripeWebhookUseCase } from '../../application/use-cases/handle-stripe-webhook.use-case';

@ApiTags('Billing')
@Controller('api/v1/billing')
export class BillingController {
  constructor(
    private readonly getBillingOverviewUseCase: GetBillingOverviewUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut tenant abonelik, kullanım ve limit bilgilerini getir' })
  @ApiResponse({ status: 200, description: 'Abonelik ve limit durumu' })
  async getOverview(@CurrentTenant() tenantId: string) {
    return this.getBillingOverviewUseCase.execute(tenantId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Checkout oturumu başlat (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 200, description: 'Checkout yönlendirme bağlantısı' })
  async createCheckout(
    @CurrentTenant() tenantId: string,
    @CurrentUser('email') email: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.createCheckoutSessionUseCase.execute(tenantId, email, {
      plan: dto.plan,
      interval: dto.interval || 'month',
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook olaylarını yakala' })
  @ApiResponse({ status: 200, description: 'Webhook işlendi' })
  async handleWebhook(@Body() event: any) {
    return this.handleStripeWebhookUseCase.execute(event);
  }
}
