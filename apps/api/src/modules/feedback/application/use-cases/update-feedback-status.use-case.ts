import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackStatus } from '@feedbackpulse/types';
import { FEEDBACK_REPOSITORY } from '../tokens';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class UpdateFeedbackStatusUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
  ) {}

  async execute(id: string, tenantId: string, status: FeedbackStatus): Promise<FeedbackEntity> {
    const feedback = await this.feedbackRepo.findById(id, tenantId);
    if (!feedback) {
      throw new NotFoundException('Geri bildirim bulunamadı');
    }

    return this.feedbackRepo.updateStatus(id, tenantId, status);
  }
}
