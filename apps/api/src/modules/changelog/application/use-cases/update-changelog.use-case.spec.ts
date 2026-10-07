import { NotFoundException } from '@nestjs/common';
import { UpdateChangelogUseCase } from './update-changelog.use-case';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';
import { ChangelogCategory } from '@feedbackpulse/types';

describe('UpdateChangelogUseCase', () => {
  let useCase: UpdateChangelogUseCase;
  let mockRepo: jest.Mocked<IChangelogRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateChangelogUseCase(mockRepo);
  });

  it('should successfully update changelog entry', async () => {
    const existing = new ChangelogEntity(
      'c-1',
      'tenant-1',
      'Eski Başlık',
      'Eski Gövde',
      'v1.0',
      ChangelogCategory.IMPROVEMENT,
      false,
      new Date(),
      new Date(),
      new Date(),
    );
    const updated = new ChangelogEntity(
      'c-1',
      'tenant-1',
      'Yeni Başlık',
      'Yeni Gövde',
      'v1.0',
      ChangelogCategory.IMPROVEMENT,
      true,
      new Date(),
      new Date(),
      new Date(),
    );

    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('c-1', 'tenant-1', {
      title: 'Yeni Başlık',
      body: 'Yeni Gövde',
      isPublished: true,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('c-1', 'tenant-1');
    expect(mockRepo.update).toHaveBeenCalled();
    expect(result.title).toBe('Yeni Başlık');
  });

  it('should throw NotFoundException if entry not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown', 'tenant-1', { title: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });
});
