import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { CreateChangelogDto } from '../dtos/create-changelog.dto';
import { UpdateChangelogDto } from '../dtos/update-changelog.dto';
import { CreateChangelogUseCase } from '../../application/use-cases/create-changelog.use-case';
import { ListChangelogsUseCase } from '../../application/use-cases/list-changelogs.use-case';
import { UpdateChangelogUseCase } from '../../application/use-cases/update-changelog.use-case';
import { DeleteChangelogUseCase } from '../../application/use-cases/delete-changelog.use-case';
import { ITenantRepository } from '../../../iam/application/ports/tenant.repository.interface';
import { TENANT_REPOSITORY } from '../../../iam/application/tokens';

@ApiTags('Changelog')
@Controller('api/v1/changelogs')
export class ChangelogController {
  constructor(
    private readonly createChangelogUseCase: CreateChangelogUseCase,
    private readonly listChangelogsUseCase: ListChangelogsUseCase,
    private readonly updateChangelogUseCase: UpdateChangelogUseCase,
    private readonly deleteChangelogUseCase: DeleteChangelogUseCase,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut tenant için yayın notlarını listele' })
  @ApiQuery({ name: 'onlyPublished', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Yayın notları listesi' })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('onlyPublished') onlyPublished?: string,
  ) {
    return this.listChangelogsUseCase.execute(tenantId, onlyPublished === 'true');
  }

  @Public()
  @Get('public/:tenantSlug')
  @ApiOperation({ summary: 'Tenant için herkese açık yayın notlarını getir' })
  @ApiResponse({ status: 200, description: 'Yayınlanmış changelog listesi' })
  async listPublic(@Param('tenantSlug') tenantSlug: string) {
    const tenant = await this.tenantRepo.findBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException('Çalışma alanı bulunamadı');
    }
    return this.listChangelogsUseCase.execute(tenant.id, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni bir yayın notu oluştur (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 201, description: 'Yayın notu oluşturuldu' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChangelogDto,
  ) {
    return this.createChangelogUseCase.execute(tenantId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yayın notunu güncelle (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 200, description: 'Yayın notu güncellendi' })
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateChangelogDto,
  ) {
    return this.updateChangelogUseCase.execute(id, tenantId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Yayın notunu sil (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 204, description: 'Yayın notu silindi' })
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.deleteChangelogUseCase.execute(id, tenantId);
  }
}
