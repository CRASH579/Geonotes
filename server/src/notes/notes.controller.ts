import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoteResponseDto } from './dto/note-response.dto';

@ApiTags('notes')
@ApiBearerAuth('firebase-jwt')
@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note at current location' })
  @ApiResponse({ status: 201, type: NoteResponseDto })
  create(@Req() req, @Body() createNoteDto: CreateNoteDto) {
    if (!req.user?.id) throw new Error('User not attached by guard - check AuthGuard is applied');
    return this.notesService.create(req.user.id, createNoteDto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get notes within a radius' })
  @ApiResponse({ status: 200, type: [NoteResponseDto] })
  findNearby(@Req() req, @Query() query: NearbyQueryDto) {
    return this.notesService.findNearby(req.user.id, query);
  }

  @Get('legacy')
  @ApiOperation({ summary: 'Fetch legacy notes directly from Firestore (read-only)' })
  getLegacyNotes() {
    return this.notesService.getLegacyNotes();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own note' })
  @ApiResponse({ status: 200, type: NoteResponseDto })
  update(@Req() req, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(req.user.id, id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete own note' })
  remove(@Req() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.id, id);
  }
}
