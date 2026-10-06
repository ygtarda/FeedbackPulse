import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { FeedbackStatus } from '@feedbackpulse/types';
import { FEEDBACK_REPOSITORY } from '../tokens';
import { IFeedbackRepository, FeedbackFilterOptions } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class ListFeedbacksUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
  ) {}

  async execute(
    tenantId: string,
    options: {
      boardId?: string;
      status?: FeedbackStatus;
      sortBy?: 'votes' | 'newest';
      currentUserId?: string;
    },
  ): Promise<FeedbackEntity[]> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği zorunludur');
    }
    return this.feedbackRepo.list(tenantId, options);
  }
}
