import { NotFoundException, BadRequestException } from '@nestjs/common';
import { VoteFeedbackUseCase } from './vote-feedback.use-case';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { IVoteRepository } from '../ports/vote.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';
import { FeedbackStatus } from '@feedbackpulse/types';

describe('VoteFeedbackUseCase', () => {
  let voteFeedbackUseCase: VoteFeedbackUseCase;
  let mockFeedbackRepo: jest.Mocked<IFeedbackRepository>;
  let mockVoteRepo: jest.Mocked<IVoteRepository>;

  beforeEach(() => {
    mockFeedbackRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      updateStatus: jest.fn(),
      update: jest.fn(),
      incrementVoteCount: jest.fn(),
      decrementVoteCount: jest.fn(),
      delete: jest.fn(),
    };

    mockVoteRepo = {
      create: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    voteFeedbackUseCase = new VoteFeedbackUseCase(mockFeedbackRepo, mockVoteRepo);
  });

  it('should cast a vote if user has not voted yet', async () => {
    const feedback = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Harika Özellik',
      'Detaylı açıklama',
      FeedbackStatus.OPEN,
      5,
    );
    mockFeedbackRepo.findById.mockResolvedValue(feedback);
    mockVoteRepo.exists.mockResolvedValue(false);
    mockFeedbackRepo.incrementVoteCount.mockResolvedValue(6);

    const result = await voteFeedbackUseCase.execute('fb-1', 'tenant-1', 'user-1');

    expect(mockVoteRepo.create).toHaveBeenCalled();
    expect(mockFeedbackRepo.incrementVoteCount).toHaveBeenCalledWith('fb-1', 'tenant-1');
    expect(result).toEqual({ voted: true, voteCount: 6 });
  });

  it('should retract vote if user has already voted', async () => {
    const feedback = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Harika Özellik',
      'Detaylı açıklama',
      FeedbackStatus.OPEN,
      6,
    );
    mockFeedbackRepo.findById.mockResolvedValue(feedback);
    mockVoteRepo.exists.mockResolvedValue(true);
    mockFeedbackRepo.decrementVoteCount.mockResolvedValue(5);

    const result = await voteFeedbackUseCase.execute('fb-1', 'tenant-1', 'user-1');

    expect(mockVoteRepo.delete).toHaveBeenCalledWith('fb-1', 'user-1');
    expect(mockFeedbackRepo.decrementVoteCount).toHaveBeenCalledWith('fb-1', 'tenant-1');
    expect(result).toEqual({ voted: false, voteCount: 5 });
  });

  it('should throw BadRequestException if feedback is closed', async () => {
    const closedFeedback = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Kapalı Özellik',
      'Detaylar',
      FeedbackStatus.CLOSED,
      3,
    );
    mockFeedbackRepo.findById.mockResolvedValue(closedFeedback);

    await expect(
      voteFeedbackUseCase.execute('fb-1', 'tenant-1', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if feedback does not exist', async () => {
    mockFeedbackRepo.findById.mockResolvedValue(null);

    await expect(
      voteFeedbackUseCase.execute('fb-unknown', 'tenant-1', 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
