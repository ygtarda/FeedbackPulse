import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ROADMAP_REPOSITORY } from '../tokens';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';

@Injectable()
export class ListRoadmapItemsUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY) private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(tenantId: string): Promise<RoadmapItemEntity[]> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }
    return this.roadmapRepo.listByTenant(tenantId);
  }
}
