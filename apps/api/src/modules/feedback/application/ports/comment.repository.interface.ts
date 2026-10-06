import { CommentEntity } from '../../domain/entities/comment.entity';

export interface ICommentRepository {
  create(comment: CommentEntity): Promise<CommentEntity>;
  listByFeedback(feedbackId: string, tenantId: string): Promise<CommentEntity[]>;
}
