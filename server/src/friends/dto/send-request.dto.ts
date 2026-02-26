import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendRequestDto {
  @ApiProperty({ example: 'crashoverride', description: 'username of the user to send request to' })
  @IsString()
  @MinLength(3)
  username: string;
}
