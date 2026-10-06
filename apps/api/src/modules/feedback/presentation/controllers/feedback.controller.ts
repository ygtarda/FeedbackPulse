import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role, FeedbackStatus } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { UpdateFeedbackStatusDto } from '../dtos/update-feedback-status.dto';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { CreateFeedbackUseCase } from '../../application/use-cases/create-feedback.use-case';
import { ListFeedbacksUseCase } from '../../application/use-cases/list-feedbacks.use-case';
import { GetFeedbackUseCase } from '../../application/use-cases/get-feedback.use-case';
import { UpdateFeedbackStatusUseCase } from '../../application/use-cases/update-feedback-status.use-case';
import { VoteFeedbackUseCase } from '../../application/use-cases/vote-feedback.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from '../../application/use-cases/list-comments.use-case';

@ApiTags('Feedbacks')
@Controller('api/v1/feedbacks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(
    private readonly createFeedbackUseCase: CreateFeedbackUseCase,
    private readonly listFeedbacksUseCase: ListFeedbacksUseCase,
    private readonly getFeedbackUseCase: GetFeedbackUseCase,
    private readonly updateFeedbackStatusUseCase: UpdateFeedbackStatusUseCase,
    private readonly voteFeedbackUseCase: VoteFeedbackUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni bir geri bildirim / özellik talebi oluştur' })
  @ApiResponse({ status: 201, description: 'Geri bildirim başarıyla oluşturuldu' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.createFeedbackUseCase.execute(tenantId, userId, userName, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Geri bildirimleri filtrele ve sırala' })
  @ApiQuery({ name: 'boardId', required: false })
  @ApiQuery({ name: 'status', enum: FeedbackStatus, required: false })
  @ApiQuery({ name: 'sortBy', enum: ['votes', 'newest'], required: false })
  @ApiResponse({ status: 200, description: 'Geri bildirim listesi' })
  async list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('boardId') boardId?: string,
    @Query('status') status?: FeedbackStatus,
    @Query('sortBy') sortBy?: 'votes' | 'newest',
  ) {
    return this.listFeedbacksUseCase.execute(tenantId, {
      boardId,
      status,
      sortBy: sortBy || 'votes',
      currentUserId: userId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Geri bildirim detayını getir' })
  @ApiResponse({ status: 200, description: 'Geri bildirim detayı' })
  async get(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.getFeedbackUseCase.execute(id, tenantId, userId);
  }

  @Patch(':id/status')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Geri bildirimin durumunu güncelle (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 200, description: 'Durum güncellendi' })
  @ApiResponse({ status: 403, description: 'Yalnızca yetkili yöneticiler durumu değiştirebilir' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateFeedbackStatusDto,
  ) {
    return this.updateFeedbackStatusUseCase.execute(id, tenantId, dto.status);
  }

  @Post(':id/vote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Geri bildirime oy ver / oyu geri çek (Toggle)' })
  @ApiResponse({ status: 200, description: 'Oy işlemi tamamlandı' })
  async toggleVote(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.voteFeedbackUseCase.execute(id, tenantId, userId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Geri bildirime yapılan yorumları listele' })
  @ApiResponse({ status: 200, description: 'Yorum listesi' })
  async listComments(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.listCommentsUseCase.execute(id, tenantId);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Geri bildirime yeni yorum ekle' })
  @ApiResponse({ status: 201, description: 'Yorum eklendi' })
  async addComment(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Body() dto: CreateCommentDto,
  ) {
    dto.feedbackId = id;
    return this.createCommentUseCase.execute(tenantId, userId, userName, dto);
  }
}
