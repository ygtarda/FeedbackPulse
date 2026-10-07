import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiSummaryUseCase } from './ai-summary.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('AiSummaryUseCase', () => {
  let useCase: AiSummaryUseCase;
  let prisma: jest.Mocked<any>;

  beforeEach(async () => {
    prisma = {
      feedback: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'fb-1',
            title: 'Slack Bildirim Entegrasyonu',
            description: 'Webhook ile bildirim gelsin',
            voteCount: 42,
          },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiSummaryUseCase,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    useCase = module.get<AiSummaryUseCase>(AiSummaryUseCase);
  });

  it('should generate summary and insights for tenant feedbacks', async () => {
    const result = await useCase.execute('tenant-123');

    expect(result.summary).toContain('Slack Bildirim Entegrasyonu');
    expect(result.topThemes).toContain('Entegrasyonlar');
    expect(result.insights.length).toBeGreaterThan(0);
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });
});
