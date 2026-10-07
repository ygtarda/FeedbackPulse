import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';
import { WebhookLogSummary } from '@feedbackpulse/types';

export interface IWebhookRepository {
  create(data: {
    tenantId: string;
    url: string;
    secret: string;
    events: string[];
    isActive?: boolean;
  }): Promise<WebhookEndpointEntity>;

  findByTenantId(tenantId: string): Promise<WebhookEndpointEntity[]>;

  findById(id: string, tenantId: string): Promise<WebhookEndpointEntity | null>;

  delete(id: string, tenantId: string): Promise<void>;

  logDelivery(data: {
    endpointId: string;
    event: string;
    payload: string;
    statusCode: number | null;
    success: boolean;
  }): Promise<WebhookLogSummary>;
}
