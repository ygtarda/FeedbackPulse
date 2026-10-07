import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CHANGELOG_REPOSITORY } from '../tokens';
import { IChangelogRepository } from '../ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';

@Injectable()
export class ListChangelogsUseCase {
  constructor(
    @Inject(CHANGELOG_REPOSITORY) private readonly changelogRepo: IChangelogRepository,
  ) {}

  async execute(tenantId: string, onlyPublished: boolean = false): Promise<ChangelogEntity[]> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }
    return this.changelogRepo.listByTenant(tenantId, onlyPublished);
  }
}
