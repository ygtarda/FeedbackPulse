import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenService } from '../ports/token-service.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { Role } from '@feedbackpulse/types';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(
      mockUserRepo,
      mockTenantRepo,
      mockHasher,
      mockTokenService,
    );
  });

  it('should successfully register user, tenant, membership and generate tokens', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockTenantRepo.findBySlug.mockResolvedValue(null);
    mockHasher.hash.mockResolvedValue('hashed_secret_password');

    const createdUser = new UserEntity(
      'user-1',
      'test@example.com',
      'hashed_secret_password',
      'Test User',
    );
    mockUserRepo.create.mockResolvedValue(createdUser);

    const createdTenant = new TenantEntity(
      'tenant-1',
      'Acme Inc',
      'acme',
    );
    mockTenantRepo.create.mockResolvedValue(createdTenant);

    mockTenantRepo.addMembership.mockResolvedValue({} as any);

    mockTokenService.generateTokens.mockResolvedValue({
      accessToken: 'access.jwt.token',
      refreshToken: 'refresh.jwt.token',
    });

    const result = await registerUseCase.execute({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      tenantName: 'Acme Inc',
      tenantSlug: 'acme',
    });

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockTenantRepo.findBySlug).toHaveBeenCalledWith('acme');
    expect(mockHasher.hash).toHaveBeenCalledWith('Password123!');
    expect(mockUserRepo.create).toHaveBeenCalled();
    expect(mockTenantRepo.create).toHaveBeenCalled();
    expect(mockTenantRepo.addMembership).toHaveBeenCalled();
    expect(result.user.id).toBe('user-1');
    expect(result.tenant?.slug).toBe('acme');
    expect(result.tokens.accessToken).toBe('access.jwt.token');
  });

  it('should throw ConflictException if user email already exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(
      new UserEntity('existing-id', 'test@example.com', 'hash', 'Existing'),
    );

    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        tenantName: 'Acme Inc',
        tenantSlug: 'acme',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockTenantRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if tenant slug already exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockTenantRepo.findBySlug.mockResolvedValue(
      new TenantEntity('t-id', 'Acme', 'acme'),
    );

    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        tenantName: 'Acme Inc',
        tenantSlug: 'acme',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });
});
