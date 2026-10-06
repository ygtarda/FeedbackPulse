import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role, RoadmapStatus } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CreateRoadmapItemDto } from '../dtos/create-roadmap-item.dto';
import { UpdateRoadmapItemDto } from '../dtos/update-roadmap-item.dto';
import { CreateRoadmapItemUseCase } from '../../application/use-cases/create-roadmap-item.use-case';
import { ListRoadmapItemsUseCase } from '../../application/use-cases/list-roadmap-items.use-case';
import { UpdateRoadmapItemUseCase } from '../../application/use-cases/update-roadmap-item.use-case';
import { DeleteRoadmapItemUseCase } from '../../application/use-cases/delete-roadmap-item.use-case';

@ApiTags('Roadmap')
@Controller('api/v1/roadmap')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoadmapController {
  constructor(
    private readonly createRoadmapItemUseCase: CreateRoadmapItemUseCase,
    private readonly listRoadmapItemsUseCase: ListRoadmapItemsUseCase,
    private readonly updateRoadmapItemUseCase: UpdateRoadmapItemUseCase,
    private readonly deleteRoadmapItemUseCase: DeleteRoadmapItemUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Yol haritasındaki (Roadmap) tüm kartları listele' })
  @ApiResponse({ status: 200, description: 'Roadmap kartları listesi' })
  async list(@CurrentTenant() tenantId: string) {
    return this.listRoadmapItemsUseCase.execute(tenantId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni yol haritası kartı oluştur (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 201, description: 'Kart başarıyla oluşturuldu' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRoadmapItemDto,
  ) {
    return this.createRoadmapItemUseCase.execute(tenantId, {
      ...dto,
      status: dto.status || RoadmapStatus.PLANNED,
      position: dto.position ?? 0,
    });
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Yol haritası kartını güncelle / sütununu değiştir (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 200, description: 'Kart güncellendi' })
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateRoadmapItemDto,
  ) {
    return this.updateRoadmapItemUseCase.execute(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Yol haritası kartını sil (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 204, description: 'Kart silindi' })
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.deleteRoadmapItemUseCase.execute(id, tenantId);
  }
}
