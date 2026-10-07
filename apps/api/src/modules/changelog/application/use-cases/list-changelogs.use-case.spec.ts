import { BadRequestException } from '@nestjs/common';
import { ListChangelogsUseCase } from './list-changelogs.use-case';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';
import { ChangelogCategory } from '@feedbackpulse/types';

describe('ListChangelogsUseCase', () => {
  let useCase: ListChangelogsUseCase;
  let mockRepo: jest.Mocked<IChangelogRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListChangelogsUseCase(mockRepo);
  });

  it('should list changelogs for tenant', async () => {
    const list = [
      new ChangelogEntity(
        'c-1',
        'tenant-1',
        'v1.0 Çıktı',
        'Detaylar',
        'v1.0',
        ChangelogCategory.NEW_FEATURE,
        true,
        new Date(),
        new Date(),
        new Date(),
      ),
    ];
    mockRepo.listByTenant.mockResolvedValue(list);

    const result = await useCase.execute('tenant-1', true);

    expect(mockRepo.listByTenant).toHaveBeenCalledWith('tenant-1', true);
    expect(result.length).toBe(1);
  });

  it('should throw BadRequestException if tenantId missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });
});
