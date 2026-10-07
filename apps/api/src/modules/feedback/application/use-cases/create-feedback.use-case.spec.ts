import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateFeedbackUseCase } from './create-feedback.use-case';
import { IBoardRepository } from '../ports/board.repository.interface';
import { IFeedbackRepository } from '../ports/feedback.repository.interface';
import { BoardEntity } from '../../domain/entities/board.entity';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';
import { FeedbackStatus } from '@feedbackpulse/types';

describe('CreateFeedbackUseCase', () => {
  let useCase: CreateFeedbackUseCase;
  let mockBoardRepo: jest.Mocked<IBoardRepository>;
  let mockFeedbackRepo: jest.Mocked<IFeedbackRepository>;

  beforeEach(() => {
    mockBoardRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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

    useCase = new CreateFeedbackUseCase(mockBoardRepo, mockFeedbackRepo);
  });

  it('should successfully create a feedback', async () => {
    const board = new BoardEntity('board-1', 'tenant-1', 'Ana Pano', 'ana-pano');
    mockBoardRepo.findById.mockResolvedValue(board);

    const createdFeedback = new FeedbackEntity(
      'fb-1',
      'tenant-1',
      'board-1',
      'Yeni Özellik',
      'Açıklama',
      FeedbackStatus.OPEN,
      0,
      0,
      'user-1',
      'Ali Veli',
    );
    mockFeedbackRepo.create.mockResolvedValue(createdFeedback);

    const result = await useCase.execute('tenant-1', 'user-1', 'Ali Veli', {
      boardId: 'board-1',
      title: 'Yeni Özellik',
      description: 'Açıklama',
    });

    expect(mockBoardRepo.findById).toHaveBeenCalledWith('board-1', 'tenant-1');
    expect(mockFeedbackRepo.create).toHaveBeenCalled();
    expect(result.title).toBe('Yeni Özellik');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute('', 'user-1', 'Ali Veli', {
        boardId: 'board-1',
        title: 'Başlık',
        description: 'Açıklama',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if board does not exist', async () => {
    mockBoardRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('tenant-1', 'user-1', 'Ali Veli', {
        boardId: 'non-existing-board',
        title: 'Başlık',
        description: 'Açıklama',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
