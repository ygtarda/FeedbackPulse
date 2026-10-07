import { NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from './get-profile.use-case';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository } from '../ports/tenant.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { Role } from '@feedbackpulse/types';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockTenantRepo: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockUserRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };

    mockTenantRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      addMembership: jest.fn(),
      getMembership: jest.fn(),
      getUserTenants: jest.fn(),
      getTenantMembers: jest.fn(),
      update: jest.fn(),
    };

    useCase = new GetProfileUseCase(mockUserRepo, mockTenantRepo);
  });

  it('should return user profile and tenants', async () => {
    const user = new UserEntity('u-1', 'test@example.com', 'hashed', 'Ahmet Yılmaz');
    mockUserRepo.findById.mockResolvedValue(user);

    const tenant = new TenantEntity('t-1', 'Acme', 'acme');
    mockTenantRepo.getUserTenants.mockResolvedValue([
      { tenant, role: Role.OWNER },
    ]);

    const result = await useCase.execute('u-1', 't-1');

    expect(result.user.id).toBe('u-1');
    expect(result.tenant?.id).toBe('t-1');
    expect(result.tenants.length).toBe(1);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('u-unknown'),
    ).rejects.toThrow(NotFoundException);
  });
});
