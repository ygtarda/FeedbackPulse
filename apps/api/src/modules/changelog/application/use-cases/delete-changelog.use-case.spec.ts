import { NotFoundException } from '@nestjs/common';
import { DeleteChangelogUseCase } from './delete-changelog.use-case';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';
import { ChangelogCategory } from '@feedbackpulse/types';

describe('DeleteChangelogUseCase', () => {
  let useCase: DeleteChangelogUseCase;
  let mockRepo: jest.Mocked<IChangelogRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteChangelogUseCase(mockRepo);
  });

  it('should successfully delete changelog entry', async () => {
    const existing = new ChangelogEntity(
      'c-1',
      'tenant-1',
      'Başlık',
      'Gövde',
      'v1.0',
      ChangelogCategory.IMPROVEMENT,
      true,
      new Date(),
      new Date(),
      new Date(),
    );
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.delete.mockResolvedValue();

    await useCase.execute('c-1', 'tenant-1');

    expect(mockRepo.findById).toHaveBeenCalledWith('c-1', 'tenant-1');
    expect(mockRepo.delete).toHaveBeenCalledWith('c-1', 'tenant-1');
  });

  it('should throw NotFoundException if entry not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
