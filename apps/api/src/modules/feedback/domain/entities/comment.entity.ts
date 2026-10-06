export class CommentEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly feedbackId: string,
    public readonly authorId: string,
    public readonly authorName: string,
    public readonly body: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
  ) {}

  static create(props: {
    id?: string;
    tenantId: string;
    feedbackId: string;
    authorId: string;
    authorName?: string;
    body: string;
  }): CommentEntity {
    return new CommentEntity(
      props.id || '',
      props.tenantId,
      props.feedbackId,
      props.authorId,
      props.authorName || 'Anonim',
      props.body.trim(),
      new Date(),
      new Date(),
      null,
    );
  }
}
