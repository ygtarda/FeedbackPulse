import { z } from 'zod';

export interface ApiResponse<T = any> {
  statusCode: number;
  message?: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
  path: string;
}

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | null;
  total?: number;
}
