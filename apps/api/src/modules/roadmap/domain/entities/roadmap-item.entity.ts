import { RoadmapStatus } from '@feedbackpulse/types';
import { FeedbackEntity } from '../../../feedback/domain/entities/feedback.entity';

export class RoadmapItemEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly title: string,
    public readonly description?: string | null,
    public readonly status: RoadmapStatus = RoadmapStatus.PLANNED,
    public readonly position: number = 0,
    public readonly feedbackId?: string | null,
    public readonly feedback?: FeedbackEntity | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(props: {
    id?: string;
    tenantId: string;
    title: string;
    description?: string | null;
    status?: RoadmapStatus;
    position?: number;
    feedbackId?: string | null;
  }): RoadmapItemEntity {
    return new RoadmapItemEntity(
      props.id || '',
      props.tenantId,
      props.title.trim(),
      props.description,
      props.status || RoadmapStatus.PLANNED,
      props.position || 0,
      props.feedbackId || null,
      null,
      new Date(),
      new Date(),
    );
  }
}
