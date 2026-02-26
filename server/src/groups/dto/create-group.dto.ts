import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name', minLength: 1, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ enum: ['PUBLIC', 'FRIENDS_ONLY'], default: 'PUBLIC' })
  @IsEnum(['PUBLIC', 'FRIENDS_ONLY'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'FRIENDS_ONLY';
}
