import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ChangelogCategory } from '@feedbackpulse/types';
import { CHANGELOG_REPOSITORY } from '../tokens';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';

export interface CreateChangelogInput {
  title: string;
  body: string;
  version?: string;
  category?: ChangelogCategory;
  isPublished?: boolean;
  publishedAt?: string;
}

@Injectable()
export class CreateChangelogUseCase {
  constructor(
    @Inject(CHANGELOG_REPOSITORY) private readonly changelogRepo: IChangelogRepository,
  ) {}

  async execute(tenantId: string, dto: CreateChangelogInput): Promise<ChangelogEntity> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    const entry = ChangelogEntity.create({
      tenantId,
      title: dto.title,
      body: dto.body,
      version: dto.version,
      category: dto.category,
      isPublished: dto.isPublished ?? true,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
    });

    return this.changelogRepo.create(entry);
  }
}
