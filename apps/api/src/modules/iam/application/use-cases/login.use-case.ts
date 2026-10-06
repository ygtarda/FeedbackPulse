import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, AuthResponse, Role } from '@feedbackpulse/types';
import {
  USER_REPOSITORY,
  TENANT_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_SERVICE,
} from '../tokens';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenService } from '../ports/token-service.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const isMatch = await this.hasher.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const userTenants = await this.tenantRepo.getUserTenants(user.id);
    let activeTenantInfo = userTenants[0];

    if (dto.tenantSlug) {
      const matched = userTenants.find((t) => t.tenant.slug === dto.tenantSlug);
      if (matched) {
        activeTenantInfo = matched;
      }
    }

    const currentTenant = activeTenantInfo ? activeTenantInfo.tenant : null;
    const currentRole = activeTenantInfo ? activeTenantInfo.role : Role.MEMBER;

    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: currentTenant?.id,
      role: currentRole,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      tenant: currentTenant
        ? {
            id: currentTenant.id,
            name: currentTenant.name,
            slug: currentTenant.slug,
            planId: currentTenant.planId || 'free-plan',
            role: currentRole,
          }
        : null,
      tenants: userTenants.map((ut) => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
        slug: ut.tenant.slug,
        planId: ut.tenant.planId || 'free-plan',
        role: ut.role,
      })),
      tokens,
    };
  }
}
