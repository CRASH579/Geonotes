import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FriendsService } from '../friends/friends.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
    private readonly friends: FriendsService,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const { title, content, latitude, longitude, visibility } = createNoteDto;
    
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new BadRequestException('Invalid coordinates');
    }

    // Because PostGIS geography is an unsupported type in prisma scheme, we must insert manually via raw sql
    // We use ST_MakePoint(longitude, latitude) - note longitude goes first in postgis
    type NearbyNote = {
      id: string;
      title: string;
      content: string;
    }
    const result = await this.prisma.$queryRaw<NearbyNote[]>`
      INSERT INTO notes (id, owner_id, title, content, location, visibility, created_at, updated_at)
      VALUES (
        gen_random_uuid(), 
        ${userId}, 
        ${title}, 
        ${content}, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
        CAST(${visibility ?? 'PRIVATE'} AS "NoteVisibility"), 
        NOW(), 
        NOW()
      )
      RETURNING id, owner_id, title, content, visibility, created_at, updated_at, 
      ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude
    `;

    return result[0];
  }

  async findNearby(userId: string, query: NearbyQueryDto) {
    const { latitude, longitude, radiusMeters = 1000 } = query;
    const friendIds = await this.friends.getFriendIds(userId);
    const friendIdList = friendIds.length > 0 ? friendIds : [''];

    const notes = await this.prisma.$queryRaw`
      SELECT
        id, owner_id, title, content, visibility, created_at, updated_at,
        ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance_meters
      FROM notes
      WHERE
        deleted_at IS NULL
        AND (
          owner_id = ${userId}
          OR visibility = 'PUBLIC'
          OR (visibility = 'FRIENDS' AND owner_id = ANY(${friendIdList}::text[]))
        )
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${Number(radiusMeters)}
        )
      ORDER BY distance_meters ASC
      LIMIT 100
    `;
    return notes;
  }

  async findMyNotes(userId: string) {
    const notes = await this.prisma.$queryRaw`
      SELECT
        id, owner_id, title, content, visibility, created_at, updated_at,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude
      FROM notes
      WHERE deleted_at IS NULL AND owner_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return notes;
  }

  async getLegacyNotes() {
    try {
      const db = this.firebase.firestore;
      
       const snapshot = await db.collection('notes')
        .get();
        

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
       console.error("Legacy notes fetch error", error);
       return [];
    }
  }

  async update(userId: string, noteId: string, updateNoteDto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    
    if (!note || note.deleted_at) throw new NotFoundException('Note not found');
    if (note.owner_id !== userId) throw new ForbiddenException('Not your note');

    // We only support updating title, content, visibility for now (not location)
    // Use Prisma for non-spatial updates easily
    return this.prisma.note.update({
        where: { id: noteId },
        data: {
            title: updateNoteDto.title,
            content: updateNoteDto.content,
            visibility: updateNoteDto.visibility,
        }
    });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    
    if (!note || note.deleted_at) throw new NotFoundException('Note not found');
    if (note.owner_id !== userId) throw new ForbiddenException('Not your note');

    // Soft delete
    return this.prisma.note.update({
        where: { id: noteId },
        data: { deleted_at: new Date() }
    });
  }
}
