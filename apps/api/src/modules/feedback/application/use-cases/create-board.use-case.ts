import { Inject, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateBoardDto } from '@feedbackpulse/types';
import { BOARD_REPOSITORY } from '../tokens';
import { IBoardRepository } from '../ports/board.repository.interface';
import { BoardEntity } from '../../domain/entities/board.entity';

@Injectable()
export class CreateBoardUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY) private readonly boardRepo: IBoardRepository,
  ) {}

  async execute(tenantId: string, dto: CreateBoardDto): Promise<BoardEntity> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    const existing = await this.boardRepo.findBySlug(dto.slug, tenantId);
    if (existing) {
      throw new ConflictException('Bu isimde/slugta bir pano zaten mevcut');
    }

    const board = BoardEntity.create({
      tenantId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      isPrivate: dto.isPrivate,
    });

    return this.boardRepo.create(board);
  }
}
