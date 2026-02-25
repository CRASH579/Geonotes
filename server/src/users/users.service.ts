import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByFirebaseUid(firebase_uid: string) {
    return this.prisma.user.findUnique({ where: { firebase_uid } });
  }

  async upsertUser(firebase_uid: string, email: string, username: string, avatar_url?: string) {
    return this.prisma.user.upsert({
      where: { firebase_uid },
      update: {
        email,
        avatar_url,
      },
      create: {
        firebase_uid,
        email,
        username,
        avatar_url,
      },
    });
  }
}
