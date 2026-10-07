import { ChangelogCategory } from '@feedbackpulse/types';

export class ChangelogEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly title: string,
    public readonly body: string,
    public readonly version: string | null,
    public readonly category: ChangelogCategory,
    public readonly isPublished: boolean,
    public readonly publishedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string;
    title: string;
    body: string;
    version?: string;
    category?: ChangelogCategory;
    isPublished?: boolean;
    publishedAt?: Date;
  }): ChangelogEntity {
    return new ChangelogEntity(
      '',
      props.tenantId,
      props.title.trim(),
      props.body.trim(),
      props.version?.trim() || null,
      props.category || ChangelogCategory.IMPROVEMENT,
      props.isPublished !== undefined ? props.isPublished : true,
      props.publishedAt || new Date(),
      new Date(),
      new Date(),
    );
  }
}
