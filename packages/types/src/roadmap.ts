import { z } from 'zod';
import { FeedbackSummary } from './feedback';

export enum RoadmapStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export const CreateRoadmapItemSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(RoadmapStatus).default(RoadmapStatus.PLANNED),
  feedbackId: z.string().uuid().optional(),
  position: z.number().int().min(0).default(0),
});

export type CreateRoadmapItemDto = z.infer<typeof CreateRoadmapItemSchema>;

export const UpdateRoadmapItemSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(RoadmapStatus).optional(),
  position: z.number().int().min(0).optional(),
});

export type UpdateRoadmapItemDto = z.infer<typeof UpdateRoadmapItemSchema>;

export interface RoadmapItemSummary {
  id: string;
  tenantId: string;
  feedbackId?: string | null;
  title: string;
  description?: string | null;
  status: RoadmapStatus;
  position: number;
  feedback?: FeedbackSummary | null;
  createdAt: string;
  updatedAt: string;
}
