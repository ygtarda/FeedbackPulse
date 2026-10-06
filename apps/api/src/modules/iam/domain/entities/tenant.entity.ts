import { TenantStatus } from '@feedbackpulse/types';

export class TenantEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly customDomain?: string | null,
    public readonly planId?: string | null,
    public readonly status: TenantStatus = TenantStatus.ACTIVE,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
  ) {}

  static create(props: {
    id?: string;
    name: string;
    slug: string;
    customDomain?: string | null;
    planId?: string | null;
    status?: TenantStatus;
  }): TenantEntity {
    return new TenantEntity(
      props.id || '',
      props.name.trim(),
      props.slug.toLowerCase().trim(),
      props.customDomain,
      props.planId || 'free-plan',
      props.status || TenantStatus.ACTIVE,
      new Date(),
      new Date(),
      null,
    );
  }

  isActive(): boolean {
    return this.status === TenantStatus.ACTIVE && !this.deletedAt;
  }
}
