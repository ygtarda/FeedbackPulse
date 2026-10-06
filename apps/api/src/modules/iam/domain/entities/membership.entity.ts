import { Role } from '@feedbackpulse/types';

export class MembershipEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly role: Role,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(props: {
    id?: string;
    userId: string;
    tenantId: string;
    role?: Role;
  }): MembershipEntity {
    return new MembershipEntity(
      props.id || '',
      props.userId,
      props.tenantId,
      props.role || Role.MEMBER,
      new Date(),
      new Date(),
    );
  }

  isOwner(): boolean {
    return this.role === Role.OWNER;
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN || this.role === Role.OWNER;
  }

  canManage(): boolean {
    return this.isAdmin();
  }
}
