export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly avatarUrl?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(props: {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    avatarUrl?: string | null;
  }): UserEntity {
    return new UserEntity(
      props.id || '',
      props.email.toLowerCase().trim(),
      props.passwordHash,
      props.name.trim(),
      props.avatarUrl,
      new Date(),
      new Date(),
    );
  }
}
