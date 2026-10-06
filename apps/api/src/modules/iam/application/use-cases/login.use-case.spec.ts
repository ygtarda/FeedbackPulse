import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenService } from '../ports/token-service.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { Role } from '@feedbackpulse/types';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockTenantRepo: jest.Mocked<ITenantRepository>;
  let mockHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockTenantRepo = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addMembership: jest.fn(),
      getMembership: jest.fn(),
      getUserTenants: jest.fn(),
      getTenantMembers: jest.fn(),
    };

    mockHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockTokenService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    loginUseCase = new LoginUseCase(
      mockUserRepo,
      mockTenantRepo,
      mockHasher,
      mockTokenService,
    );
  });

  it('should successfully authenticate user with correct password', async () => {
    const user = new UserEntity('u-1', 'user@test.com', 'hashed_pass', 'Arda');
    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockHasher.compare.mockResolvedValue(true);

    const tenant = new TenantEntity('t-1', 'My Company', 'my-company');
    mockTenantRepo.getUserTenants.mockResolvedValue([
      { tenant, role: Role.OWNER },
    ]);

    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access_tok',
      refreshToken: 'refresh_tok',
    });

    const result = await loginUseCase.execute({
      email: 'user@test.com',
      password: 'CorrectPassword123!',
    });

    expect(result.user.email).toBe('user@test.com');
    expect(result.tenant?.slug).toBe('my-company');
    expect(result.tokens.accessToken).toBe('access_tok');
  });

  it('should throw UnauthorizedException if user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'unknown@test.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const user = new UserEntity('u-1', 'user@test.com', 'hashed_pass', 'Arda');
    mockUserRepo.findByEmail.mockResolvedValue(user);
    mockHasher.compare.mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: 'user@test.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
