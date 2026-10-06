import { FeedbackStatus } from '@feedbackpulse/types';

export class FeedbackEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly boardId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: FeedbackStatus = FeedbackStatus.OPEN,
    public readonly voteCount: number = 0,
    public readonly commentCount: number = 0,
    public readonly authorId: string = 'anon',
    public readonly authorName: string = 'Anonim',
    public readonly hasVoted?: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
  ) {}

  static create(props: {
    id?: string;
    tenantId: string;
    boardId: string;
    title: string;
    description: string;
    status?: FeedbackStatus;
    authorId?: string;
    authorName?: string;
  }): FeedbackEntity {
    return new FeedbackEntity(
      props.id || '',
      props.tenantId,
      props.boardId,
      props.title.trim(),
      props.description.trim(),
      props.status || FeedbackStatus.OPEN,
      0,
      0,
      props.authorId || 'anon',
      props.authorName || 'Anonim',
      false,
      new Date(),
      new Date(),
      null,
    );
  }

  isClosed(): boolean {
    return this.status === FeedbackStatus.CLOSED;
  }
}
