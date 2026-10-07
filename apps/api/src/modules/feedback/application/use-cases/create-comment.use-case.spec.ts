import { NotFoundException } from '@nestjs/common';
import { CreateCommentUseCase } from './create-comment.use-case';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { ICommentRepository } from '../ports/comment.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { FeedbackStatus } from '@feedbackpulse/types';

describe('CreateCommentUseCase', () => {
  let useCase: CreateCommentUseCase;
  let mockFeedbackRepo: jest.Mocked<IFeedbackRepository>;
  let mockCommentRepo: jest.Mocked<ICommentRepository>;

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

    mockCommentRepo = {
      create: jest.fn(),
      listByFeedback: jest.fn(),
    };

    useCase = new CreateCommentUseCase(mockFeedbackRepo, mockCommentRepo);
  });

  it('should successfully create comment for feedback', async () => {
    const feedback = new FeedbackEntity('fb-1', 'tenant-1', 'b-1', 'Başlık', 'Açıklama', FeedbackStatus.OPEN);
    mockFeedbackRepo.findById.mockResolvedValue(feedback);

    const comment = new CommentEntity('c-1', 'tenant-1', 'fb-1', 'u-1', 'Can', 'Katılıyorum!');
    mockCommentRepo.create.mockResolvedValue(comment);

    const result = await useCase.execute('tenant-1', 'u-1', 'Can', {
      feedbackId: 'fb-1',
      body: 'Katılıyorum!',
    });

    expect(mockFeedbackRepo.findById).toHaveBeenCalledWith('fb-1', 'tenant-1');
    expect(mockCommentRepo.create).toHaveBeenCalled();
    expect(result.body).toBe('Katılıyorum!');
  });

  it('should throw NotFoundException if feedback does not exist', async () => {
    mockFeedbackRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('tenant-1', 'u-1', 'Can', {
        feedbackId: 'fb-unknown',
        body: 'Yorum',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
