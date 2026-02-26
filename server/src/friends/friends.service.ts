import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendRequestDto } from './dto/send-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  // send a friend request by username
  async sendRequest(senderId: string, dto: SendRequestDto) {
    if (!dto.username) throw new BadRequestException('username is required');

    const receiver = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!receiver) throw new NotFoundException('user not found');
    if (receiver.id === senderId) throw new BadRequestException('cannot friend yourself');

    // check if any friendship already exists in either direction
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { initiator_id: senderId, receiver_id: receiver.id },
          { initiator_id: receiver.id, receiver_id: senderId },
        ],
      },
    });
    if (existing) {
      if (existing.status === 'ACCEPTED') throw new ConflictException('already friends');
      if (existing.status === 'PENDING') throw new ConflictException('request already pending');
    }

    return this.prisma.friendship.create({
      data: { initiator_id: senderId, receiver_id: receiver.id },
      include: { receiver: { select: { id: true, username: true, avatar_url: true } } },
    });
  }

  // accept or reject a pending request sent TO the current user
  async respond(userId: string, friendshipId: string, dto: RespondRequestDto) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) throw new NotFoundException('request not found');
    if (friendship.receiver_id !== userId) throw new ForbiddenException('not your request');
    if (friendship.status !== 'PENDING') throw new BadRequestException('request already handled');

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: dto.action === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED' },
      include: {
        initiator: { select: { id: true, username: true, avatar_url: true } },
      },
    });
  }

  // accepted friends list
  async getAcceptedFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ initiator_id: userId }, { receiver_id: userId }],
      },
      include: {
        initiator: { select: { id: true, username: true, avatar_url: true } },
        receiver: { select: { id: true, username: true, avatar_url: true } },
      },
    });

    // return the other user in each friendship
    return friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.initiator_id === userId ? f.receiver : f.initiator,
      since: f.updated_at,
    }));
  }

  // pending requests received by the user
  async getPendingReceived(userId: string) {
    return this.prisma.friendship.findMany({
      where: { receiver_id: userId, status: 'PENDING' },
      include: {
        initiator: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // pending requests sent by the user
  async getPendingSent(userId: string) {
    return this.prisma.friendship.findMany({
      where: { initiator_id: userId, status: 'PENDING' },
      include: {
        receiver: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // remove / cancel friendship in either direction
  async remove(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) throw new NotFoundException('friendship not found');
    if (friendship.initiator_id !== userId && friendship.receiver_id !== userId) {
      throw new ForbiddenException('not your friendship');
    }
    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { message: 'removed' };
  }

  // helper used by notes service: return IDs of accepted friends
  async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ initiator_id: userId }, { receiver_id: userId }],
      },
      select: { initiator_id: true, receiver_id: true },
    });
    return friendships.map((f) =>
      f.initiator_id === userId ? f.receiver_id : f.initiator_id
    );
  }
}
