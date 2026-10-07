import { ChangelogEntity } from '../../domain/entities/changelog.entity';

export interface IChangelogRepository {
  create(entry: ChangelogEntity): Promise<ChangelogEntity>;
  findById(id: string, tenantId: string): Promise<ChangelogEntity | null>;
  listByTenant(tenantId: string, onlyPublished?: boolean): Promise<ChangelogEntity[]>;
  update(id: string, tenantId: string, data: Partial<ChangelogEntity>): Promise<ChangelogEntity>;
  delete(id: string, tenantId: string): Promise<void>;
}
