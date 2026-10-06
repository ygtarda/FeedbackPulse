import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@feedbackpulse/types';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { InviteMemberDto } from '../dtos/invite-member.dto';
import { InviteMemberUseCase } from '../../application/use-cases/invite-member.use-case';
import { ListMembersUseCase } from '../../application/use-cases/list-members.use-case';
import { TENANT_REPOSITORY } from '../../application/tokens';
import { ITenantRepository } from '../../application/ports/tenant.repository.interface';

@ApiTags('Tenants')
@Controller('api/v1/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
  ) {}

  @Get('current')
  @ApiOperation({ summary: 'Mevcut aktif çalışma alanının detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Aktif çalışma alanı bilgisi' })
  async getCurrentTenant(@CurrentTenant() tenantId: string) {
    if (!tenantId) {
      throw new NotFoundException('Aktif çalışma alanı belirlenemedi');
    }
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Çalışma alanı bulunamadı');
    }
    return tenant;
  }

  @Get('members')
  @ApiOperation({ summary: 'Çalışma alanının tüm üyelerini listele' })
  @ApiResponse({ status: 200, description: 'Üye listesi' })
  async getMembers(@CurrentTenant() tenantId: string) {
    return this.listMembersUseCase.execute(tenantId);
  }

  @Post('members')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Çalışma alanına yeni üye davet et / ekle (Yalnızca Owner/Admin)' })
  @ApiResponse({ status: 201, description: 'Üye başarıyla eklendi' })
  @ApiResponse({ status: 403, description: 'Yalnızca OWNER veya ADMIN yetkilidir' })
  async inviteMember(
    @CurrentTenant() tenantId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.inviteMemberUseCase.execute(tenantId, {
      email: dto.email,
      role: dto.role as Role.ADMIN | Role.MEMBER,
    });
  }
}
