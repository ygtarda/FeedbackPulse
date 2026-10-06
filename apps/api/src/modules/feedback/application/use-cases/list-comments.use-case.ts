import { Inject, Injectable } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '../tokens';
import { ICommentRepository } from '../ports/comment.repository.interface';
import { CommentEntity } from '../../domain/entities/comment.entity';

@Injectable()
export class ListCommentsUseCase {
  constructor(
    @Inject(COMMENT_REPOSITORY) private readonly commentRepo: ICommentRepository,
  ) {}

  async execute(feedbackId: string, tenantId: string): Promise<CommentEntity[]> {
    return this.commentRepo.listByFeedback(feedbackId, tenantId);
  }
}
