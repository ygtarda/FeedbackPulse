import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { RoadmapStatus } from '@feedbackpulse/types';

export class UpdateRoadmapItemDto {
  @ApiPropertyOptional({ example: 'Karanlık Mod Entegrasyonu' })
  @IsOptional()
  @IsString()
  @Length(3, 200)
  title?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş açıklama' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: RoadmapStatus })
  @IsOptional()
  @IsEnum(RoadmapStatus)
  status?: RoadmapStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
