import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ahmet@sirket.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({ example: 'Parola123!' })
  @IsString()
  @Length(8, 100, { message: 'Şifre en az 8 karakter olmalıdır' })
  password: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  @IsString()
  @IsNotEmpty({ message: 'Ad Soyad alanı gereklidir' })
  name: string;

  @ApiProperty({ example: 'Acme SaaS Ltd.' })
  @IsString()
  @IsNotEmpty({ message: 'Şirket/Çalışma alanı adı gereklidir' })
  tenantName: string;

  @ApiProperty({ example: 'acme' })
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Alt alan adı yalnızca küçük harf, rakam ve tire içerebilir',
  })
  tenantSlug: string;
}
