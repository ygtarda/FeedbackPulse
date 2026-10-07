import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUrl, IsOptional } from 'class-validator';

export class CreateWebhookEndpointDto {
  @ApiProperty({ example: 'https://api.mycompany.com/webhooks/feedback', description: 'Webhook hedef URL' })
  @IsUrl({}, { message: 'Geçerli bir URL girilmelidir' })
  url: string;

  @ApiProperty({ example: ['feedback.created', 'feedback.status_changed'], description: 'Dinlenecek olaylar' })
  @IsArray()
  events: string[];

  @ApiProperty({ required: false, description: 'Opsiyonel imza gizli anahtarı' })
  @IsString()
  @IsOptional()
  secret?: string;
}
