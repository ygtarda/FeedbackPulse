import { NotFoundException } from '@nestjs/common';
import { DeleteRoadmapItemUseCase } from './delete-roadmap-item.use-case';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';
import { RoadmapStatus } from '@feedbackpulse/types';

describe('DeleteRoadmapItemUseCase', () => {
  let useCase: DeleteRoadmapItemUseCase;
  let mockRoadmapRepo: jest.Mocked<IRoadmapRepository>;

  beforeEach(() => {
    mockRoadmapRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteRoadmapItemUseCase(mockRoadmapRepo);
  });

  it('should successfully delete a roadmap item', async () => {
    const existing = new RoadmapItemEntity('rm-1', 'tenant-1', 'Modül', 'Açıklama', RoadmapStatus.PLANNED, 0);
    mockRoadmapRepo.findById.mockResolvedValue(existing);
    mockRoadmapRepo.delete.mockResolvedValue();

    await useCase.execute('rm-1', 'tenant-1');

    expect(mockRoadmapRepo.findById).toHaveBeenCalledWith('rm-1', 'tenant-1');
    expect(mockRoadmapRepo.delete).toHaveBeenCalledWith('rm-1', 'tenant-1');
  });

  it('should throw NotFoundException if item does not exist', async () => {
    mockRoadmapRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('rm-unknown', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
