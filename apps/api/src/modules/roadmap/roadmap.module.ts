import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ROADMAP_REPOSITORY } from './application/tokens';
import { PrismaRoadmapRepository } from './infrastructure/adapters/prisma-roadmap.repository';
import { CreateRoadmapItemUseCase } from './application/use-cases/create-roadmap-item.use-case';
import { ListRoadmapItemsUseCase } from './application/use-cases/list-roadmap-items.use-case';
import { UpdateRoadmapItemUseCase } from './application/use-cases/update-roadmap-item.use-case';
import { DeleteRoadmapItemUseCase } from './application/use-cases/delete-roadmap-item.use-case';
import { RoadmapController } from './presentation/controllers/roadmap.controller';

@Module({
  controllers: [RoadmapController],
  providers: [
    PrismaService,
    { provide: ROADMAP_REPOSITORY, useClass: PrismaRoadmapRepository },
    CreateRoadmapItemUseCase,
    ListRoadmapItemsUseCase,
    UpdateRoadmapItemUseCase,
    DeleteRoadmapItemUseCase,
  ],
  exports: [ROADMAP_REPOSITORY, CreateRoadmapItemUseCase, ListRoadmapItemsUseCase],
})
export class RoadmapModule {}
