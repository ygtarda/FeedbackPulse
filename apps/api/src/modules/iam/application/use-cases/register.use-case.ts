import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { RegisterDto, AuthResponse, Role } from '@feedbackpulse/types';
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
import { UserEntity } from '../../domain/entities/user.entity';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { MembershipEntity } from '../../domain/entities/membership.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var');
    }

    const existingTenant = await this.tenantRepo.findBySlug(dto.tenantSlug);
    if (existingTenant) {
      throw new ConflictException('Bu alt alan adı (slug) zaten kullanımda');
    }

    const passwordHash = await this.hasher.hash(dto.password);

    const user = await this.userRepo.create(
      UserEntity.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
      }),
    );

    const tenant = await this.tenantRepo.create(
      TenantEntity.create({
        name: dto.tenantName,
        slug: dto.tenantSlug,
      }),
    );

    await this.tenantRepo.addMembership(
      MembershipEntity.create({
        userId: user.id,
        tenantId: tenant.id,
        role: Role.OWNER,
      }),
    );

    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      role: Role.OWNER,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        planId: tenant.planId || 'free-plan',
        role: Role.OWNER,
      },
      tenants: [
        {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          planId: tenant.planId || 'free-plan',
          role: Role.OWNER,
        },
      ],
      tokens,
    };
  }
}
