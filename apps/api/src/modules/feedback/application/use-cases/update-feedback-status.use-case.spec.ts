import { NotFoundException } from '@nestjs/common';
import { UpdateFeedbackStatusUseCase } from './update-feedback-status.use-case';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';
import { FeedbackStatus } from '@feedbackpulse/types';

describe('UpdateFeedbackStatusUseCase', () => {
  let useCase: UpdateFeedbackStatusUseCase;
  let mockFeedbackRepo: jest.Mocked<IFeedbackRepository>;

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

    useCase = new UpdateFeedbackStatusUseCase(mockFeedbackRepo);
  });

  it('should successfully update status', async () => {
    const existing = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Özellik',
      'Açıklama',
      FeedbackStatus.OPEN,
    );
    const updated = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Özellik',
      'Açıklama',
      FeedbackStatus.IN_PROGRESS,
    );

    mockFeedbackRepo.findById.mockResolvedValue(existing);
    mockFeedbackRepo.updateStatus.mockResolvedValue(updated);

    const result = await useCase.execute('fb-1', 'tenant-1', FeedbackStatus.IN_PROGRESS);

    expect(mockFeedbackRepo.findById).toHaveBeenCalledWith('fb-1', 'tenant-1');
    expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith('fb-1', 'tenant-1', FeedbackStatus.IN_PROGRESS);
    expect(result.status).toBe(FeedbackStatus.IN_PROGRESS);
  });

  it('should throw NotFoundException if feedback does not exist', async () => {
    mockFeedbackRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('fb-unknown', 'tenant-1', FeedbackStatus.IN_PROGRESS),
    ).rejects.toThrow(NotFoundException);
  });
});
