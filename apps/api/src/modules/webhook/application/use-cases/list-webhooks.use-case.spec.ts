import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListWebhooksUseCase } from './list-webhooks.use-case';
import { WEBHOOK_REPOSITORY } from '../tokens';
import { IWebhookRepository } from '../ports/webhook.repository.interface';
import { WebhookEndpointEntity } from '../../domain/entities/webhook-endpoint.entity';

describe('ListWebhooksUseCase', () => {
  let useCase: ListWebhooksUseCase;
  let mockRepo: jest.Mocked<IWebhookRepository>;

  const mockEndpoints = [
    new WebhookEndpointEntity(
      'wh-1',
      'tenant-123',
      'https://example.com/webhook',
      'whsec_abc123',
      ['feedback.created'],
      true,
      new Date(),
      new Date(),
    ),
  ];

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findByTenantId: jest.fn().mockResolvedValue(mockEndpoints),
      findById: jest.fn(),
      delete: jest.fn(),
      logDelivery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListWebhooksUseCase,
        {
          provide: WEBHOOK_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<ListWebhooksUseCase>(ListWebhooksUseCase);
  });

  it('should list all webhook endpoints for tenant', async () => {
    const res = await useCase.execute('tenant-123');

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('wh-1');
    expect(mockRepo.findByTenantId).toHaveBeenCalledWith('tenant-123');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });
});
