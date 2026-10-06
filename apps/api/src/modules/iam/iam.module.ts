import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  USER_REPOSITORY,
  TENANT_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_SERVICE,
} from './application/tokens';

import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { PrismaTenantRepository } from './infrastructure/adapters/prisma-tenant.repository';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/adapters/jwt-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { SwitchTenantUseCase } from './application/use-cases/switch-tenant.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { InviteMemberUseCase } from './application/use-cases/invite-member.use-case';
import { ListMembersUseCase } from './application/use-cases/list-members.use-case';

import { AuthController } from './presentation/controllers/auth.controller';
import { TenantController } from './presentation/controllers/tenant.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_ACCESS_SECRET',
          'feedbackpulse_access_secret_key_change_in_production',
        ),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, TenantController],
  providers: [
    PrismaService,
    // Ports & Adapters bindings
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: TENANT_REPOSITORY, useClass: PrismaTenantRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },

    // Use cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    SwitchTenantUseCase,
    GetProfileUseCase,
    InviteMemberUseCase,
    ListMembersUseCase,

    // Guards and strategies
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    USER_REPOSITORY,
    TENANT_REPOSITORY,
    TOKEN_SERVICE,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class IamModule {}
