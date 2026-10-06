import { VoteEntity } from '../../domain/entities/vote.entity';

export interface IVoteRepository {
  create(vote: VoteEntity): Promise<VoteEntity>;
  delete(feedbackId: string, voterId: string): Promise<void>;
  exists(feedbackId: string, voterId: string): Promise<boolean>;
}
