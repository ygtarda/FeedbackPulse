import { BoardEntity } from '../../domain/entities/board.entity';

export interface IBoardRepository {
  create(board: BoardEntity): Promise<BoardEntity>;
  findById(id: string, tenantId: string): Promise<BoardEntity | null>;
  findBySlug(slug: string, tenantId: string): Promise<BoardEntity | null>;
  listByTenant(tenantId: string): Promise<BoardEntity[]>;
  update(id: string, tenantId: string, data: Partial<BoardEntity>): Promise<BoardEntity>;
  delete(id: string, tenantId: string): Promise<void>;
}
