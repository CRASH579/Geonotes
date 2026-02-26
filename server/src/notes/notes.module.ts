import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [PrismaModule, AuthModule, FriendsModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
