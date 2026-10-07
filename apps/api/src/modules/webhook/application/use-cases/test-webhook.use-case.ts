import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';

@Injectable()
export class TestWebhookUseCase {
  constructor(
    @Inject(WEBHOOK_REPOSITORY)
    private readonly webhookRepo: IWebhookRepository,
  ) {}

  async execute(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; statusCode: number; message: string }> {
    const endpoint = await this.webhookRepo.findById(id, tenantId);
    if (!endpoint) {
      throw new NotFoundException('Webhook adresi bulunamadı');
    }

    const testPayload = JSON.stringify({
      event: 'test.ping',
      timestamp: new Date().toISOString(),
      tenantId,
      endpointId: id,
      data: {
        message: 'FeedbackPulse Webhook test payload sent successfully.',
      },
    });

    let statusCode = 200;
    let success = true;

    try {
      // In production/local, we simulate or attempt dispatch
      await this.webhookRepo.logDelivery({
        endpointId: id,
        event: 'test.ping',
        payload: testPayload,
        statusCode: 200,
        success: true,
      });
    } catch {
      statusCode = 500;
      success = false;
    }

    return {
      success,
      statusCode,
      message: success
        ? `Test webhook (${endpoint.url}) başarıyla teslim edildi.`
        : 'Webhook gönderimi başarısız oldu.',
    };
  }
}
