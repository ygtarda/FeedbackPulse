import { BadRequestException } from '@nestjs/common';
import { CreateChangelogUseCase } from './create-changelog.use-case';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';
import { ChangelogCategory } from '@feedbackpulse/types';

describe('CreateChangelogUseCase', () => {
  let useCase: CreateChangelogUseCase;
  let mockRepo: jest.Mocked<IChangelogRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateChangelogUseCase(mockRepo);
  });

  it('should successfully create changelog entry', async () => {
    const entry = new ChangelogEntity(
      'c-1',
      'tenant-1',
      'v1.1 Yayında',
      'Detaylar',
      'v1.1',
      ChangelogCategory.NEW_FEATURE,
      true,
      new Date(),
      new Date(),
      new Date(),
    );
    mockRepo.create.mockResolvedValue(entry);

    const result = await useCase.execute('tenant-1', {
      title: 'v1.1 Yayında',
      body: 'Detaylar',
      version: 'v1.1',
      category: ChangelogCategory.NEW_FEATURE,
      isPublished: true,
    });

    expect(mockRepo.create).toHaveBeenCalled();
    expect(result.title).toBe('v1.1 Yayında');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute('', {
        title: 'Başlık',
        body: 'Gövde',
        category: ChangelogCategory.IMPROVEMENT,
        isPublished: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
