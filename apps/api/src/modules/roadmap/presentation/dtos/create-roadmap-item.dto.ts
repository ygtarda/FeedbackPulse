import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { RoadmapStatus } from '@feedbackpulse/types';

export class CreateRoadmapItemDto {
  @ApiProperty({ example: 'Karanlık Mod Entegrasyonu' })
  @IsString()
  @Length(3, 200, { message: 'Başlık 3-200 karakter arasında olmalıdır' })
  title: string;

  @ApiPropertyOptional({ example: 'Tüm sayfalarda sistem tercihi ve manuel tema desteği' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: RoadmapStatus, default: RoadmapStatus.PLANNED })
  @IsOptional()
  @IsEnum(RoadmapStatus)
  status?: RoadmapStatus;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID('4')
  feedbackId?: string;
}
