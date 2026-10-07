import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamModule } from '../iam/iam.module';
import { ANALYTICS_REPOSITORY } from './application/tokens';
import { PrismaAnalyticsRepository } from './infrastructure/adapters/prisma-analytics.repository';
import { GetAnalyticsUseCase } from './application/use-cases/get-analytics.use-case';
import { AnalyticsController } from './presentation/controllers/analytics.controller';

@Module({
  imports: [IamModule],
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    {
      provide: ANALYTICS_REPOSITORY,
      useClass: PrismaAnalyticsRepository,
    },
    GetAnalyticsUseCase,
  ],
  exports: [GetAnalyticsUseCase],
})
export class AnalyticsModule {}
