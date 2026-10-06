import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROADMAP_REPOSITORY } from '../tokens';
import { IRoadmapRepository } from '../ports/roadmap.repository.interface';

@Injectable()
export class DeleteRoadmapItemUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY) private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const item = await this.roadmapRepo.findById(id, tenantId);
    if (!item) {
      throw new NotFoundException('Yol haritası öğesi bulunamadı');
    }

    await this.roadmapRepo.delete(id, tenantId);
  }
}
