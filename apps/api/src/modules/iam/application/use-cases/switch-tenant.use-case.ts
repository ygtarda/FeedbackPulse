import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthTokens } from '@feedbackpulse/types';
import { USER_REPOSITORY, TENANT_REPOSITORY, TOKEN_SERVICE } from '../tokens';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { ITokenService } from '../ports/token-service.interface';

@Injectable()
export class SwitchTenantUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(userId: string, targetTenantId: string): Promise<AuthTokens> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const membership = await this.tenantRepo.getMembership(userId, targetTenantId);
    if (!membership) {
      throw new ForbiddenException('Bu çalışma alanına erişim yetkiniz yok');
    }

    return await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: targetTenantId,
      role: membership.role,
    });
  }
}
