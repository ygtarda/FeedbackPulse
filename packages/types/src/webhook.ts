import { z } from 'zod';

export enum WebhookEvent {
  FEEDBACK_CREATED = 'feedback.created',
  FEEDBACK_STATUS_CHANGED = 'feedback.status_changed',
  ROADMAP_ITEM_CREATED = 'roadmap.item_created',
  ROADMAP_ITEM_MOVED = 'roadmap.item_moved',
  CHANGELOG_PUBLISHED = 'changelog.published',
}

export const CreateWebhookSchema = z.object({
  url: z.string().url('Geçerli bir URL giriniz (örn. https://api.site.com/webhook)'),
  events: z.array(z.string()).min(1, 'En az bir olay seçilmelidir'),
  secret: z.string().optional(),
});

export type CreateWebhookDto = z.infer<typeof CreateWebhookSchema>;

export const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateWebhookDto = z.infer<typeof UpdateWebhookSchema>;

export interface WebhookEndpointSummary {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLogSummary {
  id: string;
  endpointId: string;
  event: string;
  payload: string;
  statusCode: number | null;
  success: boolean;
  createdAt: string;
}
