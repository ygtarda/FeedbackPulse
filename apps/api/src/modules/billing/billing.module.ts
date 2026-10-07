import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamModule } from '../iam/iam.module';
import { SUBSCRIPTION_REPOSITORY, STRIPE_SERVICE } from './application/tokens';
import { PrismaSubscriptionRepository } from './infrastructure/adapters/prisma-subscription.repository';
import { StripeService } from './infrastructure/adapters/stripe.service';
import { GetBillingOverviewUseCase } from './application/use-cases/get-billing-overview.use-case';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { HandleStripeWebhookUseCase } from './application/use-cases/handle-stripe-webhook.use-case';
import { UsageGuard } from './application/guards/usage.guard';
import { BillingController } from './presentation/controllers/billing.controller';

@Module({
  imports: [IamModule],
  controllers: [BillingController],
  providers: [
    PrismaService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: STRIPE_SERVICE,
      useClass: StripeService,
    },
    GetBillingOverviewUseCase,
    CreateCheckoutSessionUseCase,
    HandleStripeWebhookUseCase,
    UsageGuard,
  ],
  exports: [
    SUBSCRIPTION_REPOSITORY,
    UsageGuard,
  ],
})
export class BillingModule {}
