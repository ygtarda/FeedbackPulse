import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', { message: 'Geçerli bir pano kimliği giriniz' })
  boardId: string;

  @ApiProperty({ example: 'Koyu Tema Desteği' })
  @IsString()
  @Length(3, 200, { message: 'Başlık 3-200 karakter arasında olmalıdır' })
  title: string;

  @ApiProperty({ example: 'Gece çalışan kullanıcılar için göz yormayan koyu mod eklensin.' })
  @IsString()
  @Length(5, 5000, { message: 'Açıklama 5-5000 karakter arasında olmalıdır' })
  description: string;

  @ApiPropertyOptional({ example: 'Can Yılmaz' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ example: 'can@ornek.com' })
  @IsOptional()
  @IsEmail()
  authorEmail?: string;
}
