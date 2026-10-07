import { BadRequestException } from '@nestjs/common';
import { ListFeedbacksUseCase } from './list-feedbacks.use-case';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';
import { FeedbackStatus } from '@feedbackpulse/types';

describe('ListFeedbacksUseCase', () => {
  let useCase: ListFeedbacksUseCase;
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

    useCase = new ListFeedbacksUseCase(mockFeedbackRepo);
  });

  it('should list feedbacks for given tenant', async () => {
    const list = [
      new FeedbackEntity('fb-1', 'tenant-1', 'b-1', 'Özellik 1', 'Açıklama 1', FeedbackStatus.OPEN),
    ];
    mockFeedbackRepo.list.mockResolvedValue(list);

    const result = await useCase.execute('tenant-1', { sortBy: 'votes' });

    expect(mockFeedbackRepo.list).toHaveBeenCalledWith('tenant-1', { sortBy: 'votes' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('fb-1');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute('', { sortBy: 'votes' }),
    ).rejects.toThrow(BadRequestException);
  });
});
