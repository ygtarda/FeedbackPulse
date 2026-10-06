import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserSummary, TenantSummary, Role } from '@feedbackpulse/types';
import { USER_REPOSITORY, TENANT_REPOSITORY } from '../tokens';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';

export interface ProfileResponse {
  user: UserSummary;
  tenant: TenantSummary | null;
  tenants: TenantSummary[];
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(userId: string, currentTenantId?: string): Promise<ProfileResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const userTenants = await this.tenantRepo.getUserTenants(userId);
    let activeTenantInfo = currentTenantId
      ? userTenants.find((t) => t.tenant.id === currentTenantId)
      : userTenants[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      tenant: activeTenantInfo
        ? {
            id: activeTenantInfo.tenant.id,
            name: activeTenantInfo.tenant.name,
            slug: activeTenantInfo.tenant.slug,
            planId: activeTenantInfo.tenant.planId || 'free-plan',
            role: activeTenantInfo.role,
          }
        : null,
      tenants: userTenants.map((ut) => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        slug: ut.tenant.slug,
        planId: ut.tenant.planId || 'free-plan',
        role: ut.role,
      })),
    };
  }
}
