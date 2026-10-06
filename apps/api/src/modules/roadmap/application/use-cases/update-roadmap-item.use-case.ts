import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRoadmapItemDto } from '@feedbackpulse/types';
import { ROADMAP_REPOSITORY } from '../tokens';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';

@Injectable()
export class UpdateRoadmapItemUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY) private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(
    id: string,
    tenantId: string,
    dto: UpdateRoadmapItemDto,
  ): Promise<RoadmapItemEntity> {
    const item = await this.roadmapRepo.findById(id, tenantId);
    if (!item) {
      throw new NotFoundException('Yol haritası öğesi bulunamadı');
    }

    return this.roadmapRepo.update(id, tenantId, dto);
  }
}
