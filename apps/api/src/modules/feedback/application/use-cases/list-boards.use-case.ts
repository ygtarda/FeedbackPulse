import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { BOARD_REPOSITORY } from '../tokens';
import { IBoardRepository } from '../ports/board.repository.interface';
import { BoardEntity } from '../../domain/entities/board.entity';

@Injectable()
export class ListBoardsUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY) private readonly boardRepo: IBoardRepository,
  ) {}

  async execute(tenantId: string): Promise<BoardEntity[]> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }
    return this.boardRepo.listByTenant(tenantId);
  }
}
