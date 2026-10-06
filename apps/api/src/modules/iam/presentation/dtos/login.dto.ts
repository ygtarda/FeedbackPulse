import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ahmet@sirket.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({ example: 'Parola123!' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı gereklidir' })
  password: string;

  @ApiPropertyOptional({ example: 'acme' })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
