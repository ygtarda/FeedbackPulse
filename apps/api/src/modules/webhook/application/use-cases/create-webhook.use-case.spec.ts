import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateWebhookUseCase } from './create-webhook.use-case';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';

describe('CreateWebhookUseCase', () => {
  let useCase: CreateWebhookUseCase;
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
      create: jest.fn().mockResolvedValue(mockEntity),
      findByTenantId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      logDelivery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWebhookUseCase,
        {
          provide: WEBHOOK_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateWebhookUseCase>(CreateWebhookUseCase);
  });

  it('should create webhook endpoint successfully', async () => {
    const res = await useCase.execute('tenant-123', {
      url: 'https://example.com/webhook',
      events: ['feedback.created'],
    });

    expect(res.id).toBe('wh-1');
    expect(res.url).toBe('https://example.com/webhook');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException if URL is invalid', async () => {
    await expect(
      useCase.execute('tenant-123', {
        url: 'invalid-url',
        events: ['feedback.created'],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
