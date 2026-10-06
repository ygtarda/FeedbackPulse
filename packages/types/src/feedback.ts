import { z } from 'zod';

export enum FeedbackStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export const CreateBoardSchema = z.object({
  name: z.string().min(2, 'Pano adı en az 2 karakter olmalıdır').max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Yalnızca küçük harf, rakam ve tire içerebilir'),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
});

export type CreateBoardDto = z.infer<typeof CreateBoardSchema>;

export const UpdateBoardSchema = CreateBoardSchema.partial();
export type UpdateBoardDto = z.infer<typeof UpdateBoardSchema>;

export const CreateFeedbackSchema = z.object({
  boardId: z.string().uuid('Geçerli bir pano kimliği gereklidir'),
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(200),
  description: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır').max(5000),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
});

export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;

export const UpdateFeedbackSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(5).max(5000).optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
});

export type UpdateFeedbackDto = z.infer<typeof UpdateFeedbackSchema>;

export const CreateCommentSchema = z.object({
  feedbackId: z.string().uuid(),
  body: z.string().min(1, 'Yorum boş bırakılamaz').max(2000),
  authorName: z.string().optional(),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;

export interface BoardSummary {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  isPrivate: boolean;
  feedbackCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSummary {
  id: string;
  tenantId: string;
  boardId: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentSummary {
  id: string;
  tenantId: string;
  feedbackId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}
