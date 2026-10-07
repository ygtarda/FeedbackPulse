import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateChangelogDto } from '@feedbackpulse/types';
import { CHANGELOG_REPOSITORY } from '../tokens';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';

@Injectable()
export class UpdateChangelogUseCase {
  constructor(
    @Inject(CHANGELOG_REPOSITORY) private readonly changelogRepo: IChangelogRepository,
  ) {}

  async execute(id: string, tenantId: string, dto: UpdateChangelogDto): Promise<ChangelogEntity> {
    const existing = await this.changelogRepo.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Yayın notu bulunamadı');
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.body !== undefined) updateData.body = dto.body;
    if (dto.version !== undefined) updateData.version = dto.version;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;
    if (dto.publishedAt !== undefined) updateData.publishedAt = new Date(dto.publishedAt);

    return this.changelogRepo.update(id, tenantId, updateData);
  }
}
