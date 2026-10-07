import { NotFoundException } from '@nestjs/common';
import { UpdateRoadmapItemUseCase } from './update-roadmap-item.use-case';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';
import { RoadmapStatus } from '@feedbackpulse/types';

describe('UpdateRoadmapItemUseCase', () => {
  let useCase: UpdateRoadmapItemUseCase;
  let mockRoadmapRepo: jest.Mocked<IRoadmapRepository>;

  beforeEach(() => {
    mockRoadmapRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateRoadmapItemUseCase(mockRoadmapRepo);
  });

  it('should successfully update a roadmap item', async () => {
    const existing = new RoadmapItemEntity('rm-1', 'tenant-1', 'Modül', 'Açıklama', RoadmapStatus.PLANNED, 0);
    const updated = new RoadmapItemEntity('rm-1', 'tenant-1', 'Modül', 'Açıklama', RoadmapStatus.IN_PROGRESS, 1);

    mockRoadmapRepo.findById.mockResolvedValue(existing);
    mockRoadmapRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('rm-1', 'tenant-1', {
      status: RoadmapStatus.IN_PROGRESS,
      position: 1,
    });

    expect(mockRoadmapRepo.findById).toHaveBeenCalledWith('rm-1', 'tenant-1');
    expect(mockRoadmapRepo.update).toHaveBeenCalledWith('rm-1', 'tenant-1', {
      status: RoadmapStatus.IN_PROGRESS,
      position: 1,
    });
    expect(result.status).toBe(RoadmapStatus.IN_PROGRESS);
  });

  it('should throw NotFoundException if roadmap item does not exist', async () => {
    mockRoadmapRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('rm-unknown', 'tenant-1', { status: RoadmapStatus.DONE }),
    ).rejects.toThrow(NotFoundException);
  });
});
