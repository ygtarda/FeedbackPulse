import { BadRequestException } from '@nestjs/common';
import { CreateRoadmapItemUseCase } from './create-roadmap-item.use-case';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';
import { RoadmapStatus } from '@feedbackpulse/types';

describe('CreateRoadmapItemUseCase', () => {
  let useCase: CreateRoadmapItemUseCase;
  let mockRoadmapRepo: jest.Mocked<IRoadmapRepository>;

  beforeEach(() => {
    mockRoadmapRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateRoadmapItemUseCase(mockRoadmapRepo);
  });

  it('should successfully create a roadmap item', async () => {
    const item = new RoadmapItemEntity('rm-1', 'tenant-1', 'Yeni Modül', 'Açıklama', RoadmapStatus.PLANNED, 0);
    mockRoadmapRepo.create.mockResolvedValue(item);

    const result = await useCase.execute('tenant-1', {
      title: 'Yeni Modül',
      description: 'Açıklama',
      status: RoadmapStatus.PLANNED,
      position: 0,
    });

    expect(mockRoadmapRepo.create).toHaveBeenCalled();
    expect(result.title).toBe('Yeni Modül');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute('', {
        title: 'Modül',
        status: RoadmapStatus.PLANNED,
        position: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
