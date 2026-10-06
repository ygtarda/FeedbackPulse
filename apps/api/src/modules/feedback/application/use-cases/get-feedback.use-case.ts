import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FEEDBACK_REPOSITORY } from '../tokens';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class GetFeedbackUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
  ) {}

  async execute(id: string, tenantId: string, currentUserId?: string): Promise<FeedbackEntity> {
    const feedback = await this.feedbackRepo.findById(id, tenantId, currentUserId);
    if (!feedback) {
      throw new NotFoundException('Geri bildirim bulunamadı');
    }
    return feedback;
  }
}
