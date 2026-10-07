import { BadRequestException } from '@nestjs/common';
import { ListRoadmapItemsUseCase } from './list-roadmap-items.use-case';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';
import { RoadmapStatus } from '@feedbackpulse/types';

describe('ListRoadmapItemsUseCase', () => {
  let useCase: ListRoadmapItemsUseCase;
  let mockRoadmapRepo: jest.Mocked<IRoadmapRepository>;

  beforeEach(() => {
    mockRoadmapRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListRoadmapItemsUseCase(mockRoadmapRepo);
  });

  it('should list roadmap items for given tenant', async () => {
    const list = [
      new RoadmapItemEntity('rm-1', 'tenant-1', 'Kart 1', 'Açıklama 1', RoadmapStatus.PLANNED, 0),
    ];
    mockRoadmapRepo.listByTenant.mockResolvedValue(list);

    const result = await useCase.execute('tenant-1');

    expect(mockRoadmapRepo.listByTenant).toHaveBeenCalledWith('tenant-1');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('rm-1');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute(''),
    ).rejects.toThrow(BadRequestException);
  });
});
