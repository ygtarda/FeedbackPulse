import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { UsageGuard, RequiresQuota } from '../../../billing/application/guards/usage.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CreateBoardDto } from '../dtos/create-board.dto';
import { CreateBoardUseCase } from '../../application/use-cases/create-board.use-case';
import { ListBoardsUseCase } from '../../application/use-cases/list-boards.use-case';
import { IBoardRepository } from '../../application/ports/board.repository.interface';
import { Inject } from '@nestjs/common';
import { BOARD_REPOSITORY } from '../../application/tokens';

@ApiTags('Boards')
@Controller('api/v1/boards')
@UseGuards(JwtAuthGuard, RolesGuard, UsageGuard)
@ApiBearerAuth()
export class BoardController {
  constructor(
    private readonly createBoardUseCase: CreateBoardUseCase,
    private readonly listBoardsUseCase: ListBoardsUseCase,
    @Inject(BOARD_REPOSITORY) private readonly boardRepo: IBoardRepository,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @RequiresQuota('board')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni bir feedback panosu oluştur (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 201, description: 'Pano oluşturuldu' })
  async createBoard(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.createBoardUseCase.execute(tenantId, {
      ...dto,
      isPrivate: dto.isPrivate ?? false,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Aktif çalışma alanının tüm panolarını listele' })
  @ApiResponse({ status: 200, description: 'Pano listesi' })
  async listBoards(@CurrentTenant() tenantId: string) {
    return this.listBoardsUseCase.execute(tenantId);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Pano detayını ID veya slug ile getir' })
  @ApiResponse({ status: 200, description: 'Pano detay bilgisi' })
  async getBoard(
    @CurrentTenant() tenantId: string,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    let board = await this.boardRepo.findById(idOrSlug, tenantId);
    if (!board) {
      board = await this.boardRepo.findBySlug(idOrSlug, tenantId);
    }
    if (!board) {
      throw new NotFoundException('Pano bulunamadı');
    }
    return board;
  }
}
