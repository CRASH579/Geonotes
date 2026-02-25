import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { NoteVisibility } from '@prisma/client';

export class UpdateNoteDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: NoteVisibility })
  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;
}
