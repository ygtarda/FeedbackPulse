import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { SwitchTenantUseCase } from '../../application/use-cases/switch-tenant.use-case';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly switchTenantUseCase: SwitchTenantUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı ve tenant kaydı oluştur' })
  @ApiResponse({ status: 201, description: 'Kayıt başarılı, tokenlar oluşturuldu' })
  @ApiResponse({ status: 409, description: 'E-posta veya slug zaten kullanımda' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Erişim anahtarını (Access Token) yenile' })
  @ApiResponse({ status: 200, description: 'Token yenileme başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş yenileme anahtarı' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut kullanıcı profilini ve çalışma alanlarını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı profili ve çalışma alanları' })
  async getProfile(
    @CurrentUser('id') userId: string,
    @CurrentTenant() currentTenantId?: string,
  ) {
    return this.getProfileUseCase.execute(userId, currentTenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-tenant/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktif çalışma alanını (Tenant) değiştir' })
  @ApiResponse({ status: 200, description: 'Seçili tenant ile yeni tokenlar üretildi' })
  @ApiResponse({ status: 403, description: 'Bu çalışma alanına erişim yetkisi yok' })
  async switchTenant(
    @CurrentUser('id') userId: string,
    @Param('tenantId') targetTenantId: string,
  ) {
    return this.switchTenantUseCase.execute(userId, targetTenantId);
  }
}
