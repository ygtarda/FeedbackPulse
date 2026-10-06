export class VoteEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly feedbackId: string,
    public readonly voterId: string,
    public readonly createdAt?: Date,
  ) {}

  static create(props: {
    id?: string;
    tenantId: string;
    feedbackId: string;
    voterId: string;
  }): VoteEntity {
    return new VoteEntity(
      props.id || '',
      props.tenantId,
      props.feedbackId,
      props.voterId,
      new Date(),
    );
  }
}
