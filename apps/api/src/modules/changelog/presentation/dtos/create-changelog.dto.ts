import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ChangelogCategory } from '@feedbackpulse/types';

export class CreateChangelogDto {
  @ApiProperty({ description: 'Yayın notu başlığı' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detaylı sürüm açıklaması' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ description: 'Sürüm numarası (örn. v1.2.0)' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({ enum: ChangelogCategory, default: ChangelogCategory.IMPROVEMENT })
  @IsEnum(ChangelogCategory)
  @IsOptional()
  category?: ChangelogCategory;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Yayın tarihi (ISO String)' })
  @IsString()
  @IsOptional()
  publishedAt?: string;
}
