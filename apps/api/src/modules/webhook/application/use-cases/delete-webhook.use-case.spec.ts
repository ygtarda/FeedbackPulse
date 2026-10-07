import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteWebhookUseCase } from './delete-webhook.use-case';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';

describe('DeleteWebhookUseCase', () => {
  let useCase: DeleteWebhookUseCase;
  let mockRepo: jest.Mocked<IWebhookRepository>;

  const mockEntity = new WebhookEndpointEntity(
    'wh-1',
    'tenant-123',
    'https://example.com/webhook',
    'whsec_abc123',
    ['feedback.created'],
    true,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findByTenantId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      logDelivery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWebhookUseCase,
        {
          provide: WEBHOOK_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<DeleteWebhookUseCase>(DeleteWebhookUseCase);
  });

  it('should delete existing webhook', async () => {
    mockRepo.findById.mockResolvedValue(mockEntity);

    await useCase.execute('wh-1', 'tenant-123');

    expect(mockRepo.findById).toHaveBeenCalledWith('wh-1', 'tenant-123');
    expect(mockRepo.delete).toHaveBeenCalledWith('wh-1', 'tenant-123');
  });

  it('should throw NotFoundException if webhook does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'tenant-123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
