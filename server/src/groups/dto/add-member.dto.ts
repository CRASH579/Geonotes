import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'Username of user to add' })
  @IsString()
  @IsNotEmpty()
  username: string;
}
