import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class RespondRequestDto {
  @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'] })
  @IsEnum(['ACCEPTED', 'REJECTED'])
  action: 'ACCEPTED' | 'REJECTED';
}
