import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NoteVisibility } from '@prisma/client';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Latitude coordinate (-90 to 90)' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate (-180 to 180)' })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ enum: NoteVisibility, default: NoteVisibility.PRIVATE })
  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;

  @ApiPropertyOptional({ description: 'Group ID — required when visibility is GROUP' })
  @IsUUID()
  @IsOptional()
  group_id?: string;
}
