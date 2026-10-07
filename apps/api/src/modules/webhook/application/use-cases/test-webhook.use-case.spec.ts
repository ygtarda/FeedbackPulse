import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TestWebhookUseCase } from './test-webhook.use-case';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';

describe('TestWebhookUseCase', () => {
  let useCase: TestWebhookUseCase;
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
      delete: jest.fn(),
      logDelivery: jest.fn().mockResolvedValue({
        id: 'log-1',
        endpointId: 'wh-1',
        event: 'test.ping',
        payload: '{}',
        statusCode: 200,
        success: true,
        createdAt: new Date().toISOString(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestWebhookUseCase,
        {
          provide: WEBHOOK_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<TestWebhookUseCase>(TestWebhookUseCase);
  });

  it('should test and log delivery successfully', async () => {
    mockRepo.findById.mockResolvedValue(mockEntity);

    const result = await useCase.execute('wh-1', 'tenant-123');

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(mockRepo.logDelivery).toHaveBeenCalled();
  });

  it('should throw NotFoundException if webhook does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id', 'tenant-123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
