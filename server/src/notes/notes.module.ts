import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { FirestoreService } from 'src/database/firestore.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService,FirestoreService]
})
export class NotesModule {}
