import { z } from 'zod';
import { Role } from './auth';

export enum TenantPlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export const UpdateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  customDomain: z.string().nullable().optional(),
});

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum([Role.ADMIN, Role.MEMBER]),
});

export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;

export interface TenantDetails {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  planId: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMember {
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
  createdAt: string;
}
