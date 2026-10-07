import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CHANGELOG_REPOSITORY } from '../tokens';
import { IChangelogRepository } from '../ports/changelog.repository.interface';

@Injectable()
export class DeleteChangelogUseCase {
  constructor(
    @Inject(CHANGELOG_REPOSITORY) private readonly changelogRepo: IChangelogRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.changelogRepo.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Yayın notu bulunamadı');
    }
    await this.changelogRepo.delete(id, tenantId);
  }
}
