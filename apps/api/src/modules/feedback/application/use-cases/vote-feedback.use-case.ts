import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FEEDBACK_REPOSITORY, VOTE_REPOSITORY } from '../tokens';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { IVoteRepository } from '../ports/vote.repository.interface';
import { VoteEntity } from '../../domain/entities/vote.entity';

export interface VoteResult {
  voted: boolean;
  voteCount: number;
}

@Injectable()
export class VoteFeedbackUseCase {
  constructor(
    @Inject(FEEDBACK_REPOSITORY) private readonly feedbackRepo: IFeedbackRepository,
    @Inject(VOTE_REPOSITORY) private readonly voteRepo: IVoteRepository,
  ) {}

  async execute(feedbackId: string, tenantId: string, voterId: string): Promise<VoteResult> {
    const feedback = await this.feedbackRepo.findById(feedbackId, tenantId);
    if (!feedback) {
      throw new NotFoundException('Geri bildirim bulunamadı');
    }

    if (feedback.isClosed()) {
      throw new BadRequestException('Kapanmış geri bildirimlere oy verilemez');
    }

    const hasVoted = await this.voteRepo.exists(feedbackId, voterId);

    if (hasVoted) {
      await this.voteRepo.delete(feedbackId, voterId);
      const newCount = await this.feedbackRepo.decrementVoteCount(feedbackId, tenantId);
      return { voted: false, voteCount: newCount };
    } else {
      await this.voteRepo.create(VoteEntity.create({ tenantId, feedbackId, voterId }));
      const newCount = await this.feedbackRepo.incrementVoteCount(feedbackId, tenantId);
      return { voted: true, voteCount: newCount };
    }
  }
}
