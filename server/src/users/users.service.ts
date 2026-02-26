import { Injectable, ConflictException } from '@nestjs/common';
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

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user === null;
  }

  async updateUser(id: string, username: string) {
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== id) {
      throw new ConflictException('Username is already taken');
    }
    return this.prisma.user.update({
      where: { id },
      data: { username },
    });
  }
}
