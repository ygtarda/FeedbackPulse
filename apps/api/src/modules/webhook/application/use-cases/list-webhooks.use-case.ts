import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointSummary } from '@feedbackpulse/types';

@Injectable()
export class ListWebhooksUseCase {
  constructor(
    @Inject(WEBHOOK_REPOSITORY)
    private readonly webhookRepo: IWebhookRepository,
  ) {}

  async execute(tenantId: string): Promise<WebhookEndpointSummary[]> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID gereklidir');
    }
    const list = await this.webhookRepo.findByTenantId(tenantId);
    return list.map((entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      url: entity.url,
      secret: entity.secret,
      events: entity.events,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }));
  }
}
