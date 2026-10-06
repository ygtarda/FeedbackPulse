import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthTokens, Role } from '@feedbackpulse/types';
import { USER_REPOSITORY, TENANT_REPOSITORY, TOKEN_SERVICE } from '../tokens';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { ITokenService } from '../ports/token-service.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.userRepo.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      let role = payload.role || Role.MEMBER;
      if (payload.tenantId) {
        const membership = await this.tenantRepo.getMembership(user.id, payload.tenantId);
        if (membership) {
          role = membership.role;
        }
      }

      return await this.tokenService.generateTokens({
        sub: user.id,
        email: user.email,
        tenantId: payload.tenantId,
        role,
      });
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş yenileme anahtarı');
    }
  }
}
