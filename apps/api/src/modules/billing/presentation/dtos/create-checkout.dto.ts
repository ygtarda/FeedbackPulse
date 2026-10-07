import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { PlanTier } from '@feedbackpulse/types';

export class CreateCheckoutDto {
  @ApiProperty({ enum: PlanTier, description: 'Seçilen plan' })
  @IsEnum(PlanTier)
  plan: PlanTier;

  @ApiPropertyOptional({ enum: ['month', 'year'], default: 'month' })
  @IsEnum(['month', 'year'])
  @IsOptional()
  interval?: 'month' | 'year';

  @ApiPropertyOptional({ description: 'Başarılı ödeme yönlendirme URL' })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'İptal yönlendirme URL' })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
