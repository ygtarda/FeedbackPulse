import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';

@Injectable()
export class DeleteWebhookUseCase {
  constructor(
    @Inject(WEBHOOK_REPOSITORY)
    private readonly webhookRepo: IWebhookRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    if (!id || !tenantId) {
      throw new BadRequestException('ID ve Tenant ID zorunludur');
    }
    const existing = await this.webhookRepo.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Webhook adresi bulunamadı');
    }
    await this.webhookRepo.delete(id, tenantId);
  }
}
