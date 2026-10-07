import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GetAnalyticsUseCase } from './get-analytics.use-case';
import { ANALYTICS_REPOSITORY } from '../tokens';
import { IAnalyticsRepository } from '../ports/analytics.repository.interface';
import { AnalyticsOverview } from '@feedbackpulse/types';

describe('GetAnalyticsUseCase', () => {
  let useCase: GetAnalyticsUseCase;
  let mockRepo: jest.Mocked<IAnalyticsRepository>;

  const mockOverview: AnalyticsOverview = {
    totalFeedbacks: 15,
    totalVotes: 85,
    totalComments: 30,
    resolvedRatio: 40,
    statusBreakdown: {
      open: 5,
      underReview: 2,
      planned: 2,
      inProgress: 2,
      completed: 4,
      closed: 0,
    },
    weeklyActivity: [
      { day: 'Pzt', feedbacks: 2, votes: 10 },
      { day: 'Sal', feedbacks: 3, votes: 15 },
    ],
    topRequestedFeatures: [
      { id: '1', title: 'Feature 1', voteCount: 20, status: 'OPEN' },
    ],
  };

  beforeEach(async () => {
    mockRepo = {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnalyticsUseCase,
        {
          provide: ANALYTICS_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetAnalyticsUseCase>(GetAnalyticsUseCase);
  });

  it('should return analytics overview for valid tenant', async () => {
    const result = await useCase.execute('tenant-123');

    expect(result).toEqual(mockOverview);
    expect(mockRepo.getOverview).toHaveBeenCalledWith('tenant-123');
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });
});
