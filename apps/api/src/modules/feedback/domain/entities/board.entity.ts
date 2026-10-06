export class BoardEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string | null,
    public readonly isPrivate: boolean = false,
    public readonly feedbackCount: number = 0,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
  ) {}

  static create(props: {
    id?: string;
    tenantId: string;
    name: string;
    slug: string;
    description?: string | null;
    isPrivate?: boolean;
  }): BoardEntity {
    return new BoardEntity(
      props.id || '',
      props.tenantId,
      props.name.trim(),
      props.slug.toLowerCase().trim(),
      props.description,
      props.isPrivate || false,
      0,
      new Date(),
      new Date(),
      null,
    );
  }
}
