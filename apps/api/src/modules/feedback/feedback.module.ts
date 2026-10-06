import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  BOARD_REPOSITORY,
  FEEDBACK_REPOSITORY,
  VOTE_REPOSITORY,
  COMMENT_REPOSITORY,
} from './application/tokens';

import { PrismaBoardRepository } from './infrastructure/adapters/prisma-board.repository';
import { PrismaFeedbackRepository } from './infrastructure/adapters/prisma-feedback.repository';
import { PrismaVoteRepository } from './infrastructure/adapters/prisma-vote.repository';
import { PrismaCommentRepository } from './infrastructure/adapters/prisma-comment.repository';

import { CreateBoardUseCase } from './application/use-cases/create-board.use-case';
import { ListBoardsUseCase } from './application/use-cases/list-boards.use-case';
import { CreateFeedbackUseCase } from './application/use-cases/create-feedback.use-case';
import { ListFeedbacksUseCase } from './application/use-cases/list-feedbacks.use-case';
import { GetFeedbackUseCase } from './application/use-cases/get-feedback.use-case';
import { UpdateFeedbackStatusUseCase } from './application/use-cases/update-feedback-status.use-case';
import { VoteFeedbackUseCase } from './application/use-cases/vote-feedback.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case';

import { BoardController } from './presentation/controllers/board.controller';
import { FeedbackController } from './presentation/controllers/feedback.controller';

@Module({
  controllers: [BoardController, FeedbackController],
  providers: [
    PrismaService,
    // Ports & Adapters bindings
    { provide: BOARD_REPOSITORY, useClass: PrismaBoardRepository },
    { provide: FEEDBACK_REPOSITORY, useClass: PrismaFeedbackRepository },
    { provide: VOTE_REPOSITORY, useClass: PrismaVoteRepository },
    { provide: COMMENT_REPOSITORY, useClass: PrismaCommentRepository },

    // Use cases
    CreateBoardUseCase,
    ListBoardsUseCase,
    CreateFeedbackUseCase,
    ListFeedbacksUseCase,
    GetFeedbackUseCase,
    UpdateFeedbackStatusUseCase,
    VoteFeedbackUseCase,
    CreateCommentUseCase,
    ListCommentsUseCase,
  ],
  exports: [
    BOARD_REPOSITORY,
    FEEDBACK_REPOSITORY,
    CreateBoardUseCase,
    CreateFeedbackUseCase,
  ],
})
export class FeedbackModule {}
