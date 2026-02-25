import { ApiProperty } from '@nestjs/swagger';
import { NoteVisibility } from '@prisma/client';

export class NoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ enum: NoteVisibility })
  visibility: NoteVisibility;

  @ApiProperty({ required: false })
  distance_meters?: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
