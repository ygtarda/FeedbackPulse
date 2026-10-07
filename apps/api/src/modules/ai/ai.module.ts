import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamModule } from '../iam/iam.module';
import { AiSummaryUseCase } from './application/use-cases/ai-summary.use-case';
import { AiDuplicateCheckUseCase } from './application/use-cases/ai-duplicate-check.use-case';
import { AiController } from './presentation/controllers/ai.controller';

@Module({
  imports: [IamModule],
  controllers: [AiController],
  providers: [
    PrismaService,
    AiSummaryUseCase,
    AiDuplicateCheckUseCase,
  ],
  exports: [
    AiSummaryUseCase,
    AiDuplicateCheckUseCase,
  ],
})
export class AiModule {}
