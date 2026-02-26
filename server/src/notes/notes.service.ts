import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

  async create(userId: string, dto: CreateNoteDto) {
    const { title, content, latitude, longitude, visibility = 'PRIVATE', group_id } = dto;

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid coordinates');
    }

    // Spec invariant: GROUP visibility requires group_id; others must not have it
    if (visibility === 'GROUP' && !group_id) {
      throw new BadRequestException('group_id is required when visibility is GROUP');
    }
    if (visibility !== 'GROUP' && group_id) {
      throw new BadRequestException('group_id must be omitted unless visibility is GROUP');
    }

    // Verify caller is a member of the target group
    if (group_id) {
      const membership = await this.prisma.groupMember.findUnique({
        where: { group_id_user_id: { group_id, user_id: userId } },
      });
      if (!membership) {
        throw new ForbiddenException('You are not a member of this group');
      }
    }

    // Raw SQL required for PostGIS geography insertion
    const result = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO notes (id, owner_id, group_id, title, content, location, visibility, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${group_id ?? null},
        ${title},
        ${content},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        CAST(${visibility} AS "NoteVisibility"),
        NOW(),
        NOW()
      )
      RETURNING id, owner_id, group_id, title, content, visibility, created_at, updated_at,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
    `;

    return result[0];
  }

  async findNearby(userId: string, query: NearbyQueryDto) {
    const { latitude, longitude, radiusMeters = 500_000 } = query;

    const friendIds = await this.friends.getFriendIds(userId);
    const friendIdList = friendIds.length > 0 ? friendIds : [''];

    // All visibility checks in SQL per spec:
    //   PRIVATE → owner only
    //   FRIENDS → owner + accepted friends
    //   GROUP   → owner + group members (EXISTS subquery)
    //   PUBLIC  → everyone
    const notes = await this.prisma.$queryRaw`
      SELECT
        n.id,
        n.owner_id,
        u.username  AS owner_username,
        n.group_id,
        n.title,
        n.content,
        n.visibility,
        n.created_at,
        n.updated_at,
        ST_X(n.location::geometry) AS longitude,
        ST_Y(n.location::geometry) AS latitude,
        ST_Distance(
          n.location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) AS distance_meters
      FROM notes n
      JOIN users u ON u.id = n.owner_id
      WHERE
        n.deleted_at IS NULL
        AND (
          n.owner_id = ${userId}
          OR n.visibility = 'PUBLIC'
          OR (n.visibility = 'FRIENDS' AND n.owner_id = ANY(${friendIdList}::text[]))
          OR (
            n.visibility = 'GROUP'
            AND EXISTS (
              SELECT 1 FROM group_members gm
              WHERE gm.group_id = n.group_id
                AND gm.user_id = ${userId}
            )
          )
        )
        AND ST_DWithin(
          n.location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${Number(radiusMeters)}
        )
      ORDER BY distance_meters ASC
      LIMIT 100
    `;

    return notes;
  }

  // All accessible notes with no spatial filter — FRIENDS, GROUP, and PUBLIC notes
  // from other users. Own notes come via /mine; this covers everything else so that
  // social/public content is always visible regardless of location availability.
  async findSocial(userId: string) {
    const friendIds = await this.friends.getFriendIds(userId);
    const friendIdList = friendIds.length > 0 ? friendIds : [''];

    return this.prisma.$queryRaw`
      SELECT
        n.id,
        n.owner_id,
        u.username  AS owner_username,
        n.group_id,
        n.title,
        n.content,
        n.visibility,
        n.created_at,
        n.updated_at,
        ST_X(n.location::geometry) AS longitude,
        ST_Y(n.location::geometry) AS latitude
      FROM notes n
      JOIN users u ON u.id = n.owner_id
      WHERE
        n.deleted_at IS NULL
        AND (
          (n.visibility = 'FRIENDS' AND n.owner_id = ANY(${friendIdList}::text[]))
          OR (
            n.visibility = 'GROUP'
            AND EXISTS (
              SELECT 1 FROM group_members gm
              WHERE gm.group_id = n.group_id
                AND gm.user_id = ${userId}
            )
          )
          OR (n.visibility = 'PUBLIC' AND n.owner_id != ${userId})
        )
      ORDER BY n.created_at DESC
      LIMIT 500
    `;
  }

  async findMyNotes(userId: string) {
    const notes = await this.prisma.$queryRaw`
      SELECT
        n.id,
        n.owner_id,
        u.username  AS owner_username,
        n.group_id,
        n.title,
        n.content,
        n.visibility,
        n.created_at,
        n.updated_at,
        ST_X(n.location::geometry) AS longitude,
        ST_Y(n.location::geometry) AS latitude
      FROM notes n
      JOIN users u ON u.id = n.owner_id
      WHERE n.deleted_at IS NULL AND n.owner_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 200
    `;
    return notes;
  }

  // Legacy notes from Firestore — read-only, private archive.
  // The old Flutter app stored notes in a flat collection with no uid field,
  // so per-user filtering is not possible without data migration.
  async getLegacyNotes() {
    try {
      const snapshot = await this.firebase.firestore.collection('notes').get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Legacy notes fetch error', error);
      return [];
    }
  }

  async update(userId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.deleted_at) throw new NotFoundException('Note not found');
    if (note.owner_id !== userId) throw new ForbiddenException('Not your note');

    // Cannot switch a non-GROUP note TO GROUP via edit — UpdateNoteDto has no group_id field
    if (dto.visibility === 'GROUP' && note.visibility !== 'GROUP') {
      throw new BadRequestException(
        'Cannot change visibility to GROUP via edit. Delete and recreate the note in a group.',
      );
    }

    // Changing away from GROUP must clear group_id to maintain the visibility invariant
    const clearGroupId = dto.visibility && dto.visibility !== 'GROUP' && note.visibility === 'GROUP';

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility,
        ...(clearGroupId ? { group_id: null } : {}),
      },
    });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.deleted_at) throw new NotFoundException('Note not found');
    if (note.owner_id !== userId) throw new ForbiddenException('Not your note');

    return this.prisma.note.update({
      where: { id: noteId },
      data: { deleted_at: new Date() },
    });
  }
}
