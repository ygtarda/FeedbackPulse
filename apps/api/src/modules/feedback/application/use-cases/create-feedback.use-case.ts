import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from '@feedbackpulse/types';
import { BOARD_REPOSITORY, FEEDBACK_REPOSITORY } from '../tokens';
import { IBoardRepository } from '../ports/board.repository.interface';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class CreateFeedbackUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY) private readonly boardRepo: IBoardRepository,
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
  ) {}

  async execute(
    tenantId: string,
    authorId: string,
    authorName: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackEntity> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }

    const board = await this.boardRepo.findById(dto.boardId, tenantId);
    if (!board) {
      throw new NotFoundException('Belirtilen pano bulunamadı');
    }

    const feedback = FeedbackEntity.create({
      tenantId,
      boardId: dto.boardId,
      title: dto.title,
      description: dto.description,
      authorId,
      authorName: dto.authorName || authorName || 'Anonim',
    });

    return this.feedbackRepo.create(feedback);
  }
}
