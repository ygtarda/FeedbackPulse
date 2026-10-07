import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamModule } from '../iam/iam.module';
import { CHANGELOG_REPOSITORY } from './application/tokens';
import { PrismaChangelogRepository } from './infrastructure/adapters/prisma-changelog.repository';
import { CreateChangelogUseCase } from './application/use-cases/create-changelog.use-case';
import { ListChangelogsUseCase } from './application/use-cases/list-changelogs.use-case';
import { UpdateChangelogUseCase } from './application/use-cases/update-changelog.use-case';
import { DeleteChangelogUseCase } from './application/use-cases/delete-changelog.use-case';
import { ChangelogController } from './presentation/controllers/changelog.controller';

@Module({
  imports: [IamModule],
  controllers: [ChangelogController],
  providers: [
    PrismaService,
    {
      provide: CHANGELOG_REPOSITORY,
      useClass: PrismaChangelogRepository,
    },
    CreateChangelogUseCase,
    ListChangelogsUseCase,
    UpdateChangelogUseCase,
    DeleteChangelogUseCase,
  ],
  exports: [
    CHANGELOG_REPOSITORY,
    ListChangelogsUseCase,
  ],
})
export class ChangelogModule {}
