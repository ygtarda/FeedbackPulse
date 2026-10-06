import { FeedbackStatus } from '@feedbackpulse/types';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

export interface FeedbackFilterOptions {
  boardId?: string;
  status?: FeedbackStatus;
  sortBy?: 'votes' | 'newest';
  currentUserId?: string;
}

export interface IFeedbackRepository {
  create(feedback: FeedbackEntity): Promise<FeedbackEntity>;
  findById(id: string, tenantId: string, currentUserId?: string): Promise<FeedbackEntity | null>;
  list(tenantId: string, options: FeedbackFilterOptions): Promise<FeedbackEntity[]>;
  updateStatus(id: string, tenantId: string, status: FeedbackStatus): Promise<FeedbackEntity>;
  update(id: string, tenantId: string, data: Partial<FeedbackEntity>): Promise<FeedbackEntity>;
  incrementVoteCount(id: string, tenantId: string): Promise<number>;
  decrementVoteCount(id: string, tenantId: string): Promise<number>;
  delete(id: string, tenantId: string): Promise<void>;
}
