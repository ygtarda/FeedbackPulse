import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointSummary } from '@feedbackpulse/types';

@Injectable()
export class CreateWebhookUseCase {
  constructor(
    @Inject(WEBHOOK_REPOSITORY)
    private readonly webhookRepo: IWebhookRepository,
  ) {}

  async execute(
    tenantId: string,
    dto: { url: string; events: string[]; secret?: string },
  ): Promise<WebhookEndpointSummary> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID gereklidir');
    }
    if (!dto.url || !dto.url.startsWith('http')) {
      throw new BadRequestException('Geçerli bir webhook URL adresi giriniz');
    }
    if (!dto.events || dto.events.length === 0) {
      throw new BadRequestException('En az bir webhook olayı seçilmelidir');
    }

    const secret =
      dto.secret || `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const entity = await this.webhookRepo.create({
      tenantId,
      url: dto.url,
      secret,
      events: dto.events,
      isActive: true,
    });

    return {
      id: entity.id,
      tenantId: entity.tenantId,
      url: entity.url,
      secret: entity.secret,
      events: entity.events,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
