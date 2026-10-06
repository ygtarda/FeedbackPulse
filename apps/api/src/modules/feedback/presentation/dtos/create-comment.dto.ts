import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4')
  feedbackId: string;

  @ApiProperty({ example: 'Bu özellik bizim için de çok öncelikli!' })
  @IsString()
  @Length(1, 2000, { message: 'Yorum 1-2000 karakter arasında olmalıdır' })
  body: string;

  @ApiPropertyOptional({ example: 'Gizem Ak' })
  @IsOptional()
  @IsString()
  authorName?: string;
}
