import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CreateRoadmapItemDto } from '@feedbackpulse/types';
import { ROADMAP_REPOSITORY } from '../tokens';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';

@Injectable()
export class CreateRoadmapItemUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY) private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(tenantId: string, dto: CreateRoadmapItemDto): Promise<RoadmapItemEntity> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    const item = RoadmapItemEntity.create({
      tenantId,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      position: dto.position || 0,
      feedbackId: dto.feedbackId,
    });

    return this.roadmapRepo.create(item);
  }
}
