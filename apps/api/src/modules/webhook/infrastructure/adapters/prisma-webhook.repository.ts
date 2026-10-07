import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IWebhookRepository } from '../../application/ports/webhook.repository.interface';
import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';
import { WebhookLogSummary } from '@feedbackpulse/types';

@Injectable()
export class PrismaWebhookRepository implements IWebhookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: string;
    url: string;
    secret: string;
    events: string[];
    isActive?: boolean;
  }): Promise<WebhookEndpointEntity> {
    const raw = await this.prisma.webhookEndpoint.create({
      data: {
        tenantId: data.tenantId,
        url: data.url,
        secret: data.secret,
        events: JSON.stringify(data.events),
        isActive: data.isActive ?? true,
      },
    });

    return this.mapToEntity(raw);
  }

  async findByTenantId(tenantId: string): Promise<WebhookEndpointEntity[]> {
    const records = await this.prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async findById(id: string, tenantId: string): Promise<WebhookEndpointEntity | null> {
    const raw = await this.prisma.webhookEndpoint.findFirst({
      where: { id, tenantId },
    });
    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.webhookEndpoint.deleteMany({
      where: { id, tenantId },
    });
  }

  async logDelivery(data: {
    endpointId: string;
    event: string;
    payload: string;
    statusCode: number | null;
    success: boolean;
  }): Promise<WebhookLogSummary> {
    const log = await this.prisma.webhookLog.create({
      data: {
        endpointId: data.endpointId,
        event: data.event,
        payload: data.payload,
        statusCode: data.statusCode,
        success: data.success,
      },
    });

    return {
      id: log.id,
      endpointId: log.endpointId,
      event: log.event,
      payload: log.payload,
      statusCode: log.statusCode,
      success: log.success,
      createdAt: log.createdAt.toISOString(),
    };
  }

  private mapToEntity(raw: any): WebhookEndpointEntity {
    let parsedEvents: string[] = [];
    try {
      parsedEvents = JSON.parse(raw.events);
    } catch {
      parsedEvents = [raw.events];
    }

    return new WebhookEndpointEntity(
      raw.id,
      raw.tenantId,
      raw.url,
      raw.secret,
      parsedEvents,
      raw.isActive,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
