import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Unique username (3-20 chars, letters/numbers/underscores only)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;
}
