import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'Genel Geri Bildirimler' })
  @IsString()
  @Length(2, 100, { message: 'Pano adı 2-100 karakter arasında olmalıdır' })
  name: string;

  @ApiProperty({ example: 'genel' })
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug yalnızca küçük harf, rakam ve tire içerebilir',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'Müşterilerimizin genel ürün önerileri' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
