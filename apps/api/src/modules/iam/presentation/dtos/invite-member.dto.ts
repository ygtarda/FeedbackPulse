import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@feedbackpulse/types';

export class InviteMemberDto {
  @ApiProperty({ example: 'mehmet@sirket.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.MEMBER], default: Role.MEMBER })
  @IsEnum([Role.ADMIN, Role.MEMBER], { message: 'Geçerli bir rol seçiniz (ADMIN veya MEMBER)' })
  @IsNotEmpty()
  role: Role;
}
