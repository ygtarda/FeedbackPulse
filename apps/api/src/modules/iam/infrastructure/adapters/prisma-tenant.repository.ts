import { Injectable } from '@nestjs/common';
import { Role, TenantStatus } from '@feedbackpulse/types';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  ITenantRepository,
  UserTenantInfo,
  TenantMemberInfo,
} from '../../application/ports/tenant.repository.interface';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { MembershipEntity } from '../../domain/entities/membership.entity';

@Injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): TenantEntity {
    return new TenantEntity(
      raw.id,
      raw.name,
      raw.slug,
      raw.customDomain,
      raw.planId,
      raw.status as TenantStatus,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    const raw = await this.prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findById(id: string): Promise<TenantEntity | null> {
    const raw = await this.prisma.tenant.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    const raw = await this.prisma.tenant.create({
      data: {
        name: tenant.name,
        slug: tenant.slug,
        customDomain: tenant.customDomain,
        planId: tenant.planId || 'free-plan',
        status: (tenant.status as any) || 'ACTIVE',
      },
    });
    return this.toDomain(raw);
  }

  async update(id: string, tenant: Partial<TenantEntity>): Promise<TenantEntity> {
    const data: any = {};
    if (tenant.name !== undefined) data.name = tenant.name;
    if (tenant.customDomain !== undefined) data.customDomain = tenant.customDomain;
    if (tenant.planId !== undefined) data.planId = tenant.planId;
    if (tenant.status !== undefined) data.status = tenant.status;

    const raw = await this.prisma.tenant.update({
      where: { id },
      data,
    });
    return this.toDomain(raw);
  }

  async addMembership(membership: MembershipEntity): Promise<MembershipEntity> {
    const raw = await this.prisma.tenantMembership.create({
      data: {
        userId: membership.userId,
        tenantId: membership.tenantId,
        role: membership.role as any,
      },
    });
    return new MembershipEntity(
      raw.id,
      raw.userId,
      raw.tenantId,
      raw.role as Role,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async getMembership(userId: string, tenantId: string): Promise<MembershipEntity | null> {
    const raw = await this.prisma.tenantMembership.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });
    return raw
      ? new MembershipEntity(
          raw.id,
          raw.userId,
          raw.tenantId,
          raw.role as Role,
          raw.createdAt,
          raw.updatedAt,
        )
      : null;
  }

  async getUserTenants(userId: string): Promise<UserTenantInfo[]> {
    const memberships = await this.prisma.tenantMembership.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      tenant: this.toDomain(m.tenant),
      role: m.role as Role,
    }));
  }

  async getTenantMembers(tenantId: string): Promise<TenantMemberInfo[]> {
    const memberships = await this.prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      tenantId: m.tenantId,
      role: m.role as Role,
      user: m.user,
      createdAt: m.createdAt,
    }));
  }
}
