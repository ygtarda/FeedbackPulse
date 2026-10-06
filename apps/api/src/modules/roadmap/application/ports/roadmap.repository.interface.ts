import { RoadmapStatus } from '@feedbackpulse/types';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';

export interface IRoadmapRepository {
  create(item: RoadmapItemEntity): Promise<RoadmapItemEntity>;
  findById(id: string, tenantId: string): Promise<RoadmapItemEntity | null>;
  listByTenant(tenantId: string): Promise<RoadmapItemEntity[]>;
  update(
    id: string,
    tenantId: string,
    data: {
      title?: string;
      description?: string;
      status?: RoadmapStatus;
      position?: number;
    },
  ): Promise<RoadmapItemEntity>;
  delete(id: string, tenantId: string): Promise<void>;
}
