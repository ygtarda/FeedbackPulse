import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from '@feedbackpulse/types';
import { FEEDBACK_REPOSITORY, COMMENT_REPOSITORY } from '../tokens';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { ICommentRepository } from '../ports/comment.repository.interface';
import { CommentEntity } from '../../domain/entities/comment.entity';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
    @Inject(COMMENT_REPOSITORY) private readonly commentRepo: ICommentRepository,
  ) {}

  async execute(
    tenantId: string,
    authorId: string,
    authorName: string,
    dto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const feedback = await this.feedbackRepo.findById(dto.feedbackId, tenantId);
    if (!feedback) {
      throw new NotFoundException('Geri bildirim bulunamadı');
    }

    const comment = CommentEntity.create({
      tenantId,
      feedbackId: dto.feedbackId,
      authorId,
      authorName: dto.authorName || authorName || 'Anonim',
      body: dto.body,
    });

    return this.commentRepo.create(comment);
  }
}
