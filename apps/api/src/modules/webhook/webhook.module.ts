import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamModule } from '../iam/iam.module';
import { WEBHOOK_REPOSITORY } from './application/tokens';
import { PrismaWebhookRepository } from './infrastructure/adapters/prisma-webhook.repository';
import { CreateWebhookUseCase } from './application/use-cases/create-webhook.use-case';
import { ListWebhooksUseCase } from './application/use-cases/list-webhooks.use-case';
import { DeleteWebhookUseCase } from './application/use-cases/delete-webhook.use-case';
import { TestWebhookUseCase } from './application/use-cases/test-webhook.use-case';
import { WebhookController } from './presentation/controllers/webhook.controller';

@Module({
  imports: [IamModule],
  controllers: [WebhookController],
  providers: [
    PrismaService,
    {
      provide: WEBHOOK_REPOSITORY,
      useClass: PrismaWebhookRepository,
    },
    CreateWebhookUseCase,
    ListWebhooksUseCase,
    DeleteWebhookUseCase,
    TestWebhookUseCase,
  ],
  exports: [
    WEBHOOK_REPOSITORY,
    CreateWebhookUseCase,
    ListWebhooksUseCase,
  ],
})
export class WebhookModule {}
