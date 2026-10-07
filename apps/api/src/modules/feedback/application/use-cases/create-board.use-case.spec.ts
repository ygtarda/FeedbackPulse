import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateBoardUseCase } from './create-board.use-case';
import { IBoardRepository } from '../ports/board.repository.interface';
import { BoardEntity } from '../../domain/entities/board.entity';

describe('CreateBoardUseCase', () => {
  let useCase: CreateBoardUseCase;
  let mockBoardRepo: jest.Mocked<IBoardRepository>;

  beforeEach(() => {
    mockBoardRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      listByTenant: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateBoardUseCase(mockBoardRepo);
  });

  it('should successfully create a board', async () => {
    mockBoardRepo.findBySlug.mockResolvedValue(null);
    const createdBoard = new BoardEntity('board-1', 'tenant-1', 'Mobil App', 'mobil-app', 'Mobil talepler', false);
    mockBoardRepo.create.mockResolvedValue(createdBoard);

    const result = await useCase.execute('tenant-1', {
      name: 'Mobil App',
      slug: 'mobil-app',
      isPrivate: false,
      description: 'Mobil talepler',
    });

    expect(mockBoardRepo.findBySlug).toHaveBeenCalledWith('mobil-app', 'tenant-1');
    expect(mockBoardRepo.create).toHaveBeenCalled();
    expect(result.slug).toBe('mobil-app');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(
      useCase.execute('', { name: 'Mobil', slug: 'mobil', isPrivate: false }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if slug already exists in tenant', async () => {
    const existing = new BoardEntity('board-existing', 'tenant-1', 'Eski', 'mobil-app', 'Açıklama', false);
    mockBoardRepo.findBySlug.mockResolvedValue(existing);

    await expect(
      useCase.execute('tenant-1', { name: 'Mobil 2', slug: 'mobil-app', isPrivate: false }),
    ).rejects.toThrow(ConflictException);
  });
});
