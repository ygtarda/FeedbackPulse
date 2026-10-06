import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FeedbackStatus } from '@feedbackpulse/types';

export class UpdateFeedbackStatusDto {
  @ApiProperty({ enum: FeedbackStatus, example: FeedbackStatus.PLANNED })
  @IsEnum(FeedbackStatus, { message: 'Geçerli bir durum seçiniz' })
  @IsNotEmpty()
  status: FeedbackStatus;
}
