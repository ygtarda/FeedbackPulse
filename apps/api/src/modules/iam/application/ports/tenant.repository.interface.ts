import { Role } from '@feedbackpulse/types';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { MembershipEntity } from '../../domain/entities/membership.entity';

export interface UserTenantInfo {
  tenant: TenantEntity;
  role: Role;
}

export interface TenantMemberInfo {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  createdAt: Date;
}

export interface ITenantRepository {
  findBySlug(slug: string): Promise<TenantEntity | null>;
  findById(id: string): Promise<TenantEntity | null>;
  create(tenant: TenantEntity): Promise<TenantEntity>;
  update(id: string, tenant: Partial<TenantEntity>): Promise<TenantEntity>;
  addMembership(membership: MembershipEntity): Promise<MembershipEntity>;
  getMembership(userId: string, tenantId: string): Promise<MembershipEntity | null>;
  getUserTenants(userId: string): Promise<UserTenantInfo[]>;
  getTenantMembers(tenantId: string): Promise<TenantMemberInfo[]>;
}
