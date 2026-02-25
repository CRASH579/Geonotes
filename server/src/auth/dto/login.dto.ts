import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Firebase ID token retrieved from client SDK' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
