import { z } from 'zod';

export enum ChangelogCategory {
  NEW_FEATURE = 'NEW_FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  BUG_FIX = 'BUG_FIX',
}

export const CreateChangelogSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır').max(150),
  body: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
  version: z.string().optional(),
  category: z.nativeEnum(ChangelogCategory).default(ChangelogCategory.IMPROVEMENT),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().optional(),
});

export type CreateChangelogDto = z.infer<typeof CreateChangelogSchema>;

export const UpdateChangelogSchema = CreateChangelogSchema.partial();

export type UpdateChangelogDto = z.infer<typeof UpdateChangelogSchema>;

export interface ChangelogEntrySummary {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  version: string | null;
  category: ChangelogCategory;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}
