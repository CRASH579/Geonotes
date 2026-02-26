import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create group — creator becomes OWNER member 
  async createGroup(userId: string, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        owner_id: userId,
        visibility: dto.visibility ?? 'PUBLIC',
        members: {
          create: { user_id: userId, role: 'OWNER' },
        },
      },
      include: { members: { include: { user: { select: { id: true, username: true, avatar_url: true } } } } },
    });
    return group;
  }

  // List all groups where current user is a member
  async getMyGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { user_id: userId },
      include: {
        group: {
          include: {
            _count: { select: { members: true, notes: { where: { deleted_at: null } } } },
          },
        },
      },
      orderBy: { group: { created_at: 'desc' } },
    });
    return memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
      memberCount: m.group._count.members,
      noteCount: m.group._count.notes,
    }));
  }

  // Get group detail with members (member-only access)
  async getGroup(userId: string, groupId: string) {
    await this.assertMember(userId, groupId);

    return this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatar_url: true } },
          },
          orderBy: { role: 'asc' },
        },
      },
    });
  }

  // Add member by username (owner or admin only) 
  async addMember(requesterId: string, groupId: string, dto: AddMemberDto) {
    await this.assertRole(requesterId, groupId, ['OWNER', 'ADMIN']);

    const targetUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!targetUser) throw new NotFoundException('User not found');

    const existing = await this.prisma.groupMember.findUnique({
      where: { group_id_user_id: { group_id: groupId, user_id: targetUser.id } },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.groupMember.create({
      data: { group_id: groupId, user_id: targetUser.id, role: 'MEMBER' },
      include: { user: { select: { id: true, username: true, avatar_url: true } } },
    });
  }

  // Remove member — owner cannot be removed; only owner/admin can remove
  async removeMember(requesterId: string, groupId: string, targetUserId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { group_id_user_id: { group_id: groupId, user_id: targetUserId } },
    });
    if (!membership) throw new NotFoundException('Member not found');

    // Owner cannot be removed
    if (membership.role === 'OWNER') throw new ForbiddenException('Cannot remove group owner');

    // Requester removing themselves (leave), or owner/admin removing others
    if (requesterId !== targetUserId) {
      await this.assertRole(requesterId, groupId, ['OWNER', 'ADMIN']);
    }

    await this.prisma.groupMember.delete({
      where: { group_id_user_id: { group_id: groupId, user_id: targetUserId } },
    });
    return { message: 'removed' };
  }

  // Delete entire group — owner only
  async deleteGroup(userId: string, groupId: string) {
    await this.assertRole(userId, groupId, ['OWNER']);

    // Convert GROUP-visibility notes in this group to PRIVATE before deletion.
    // Without this, the DB cascade (SetNull on group_id) would leave notes with
    // visibility=GROUP but group_id=null — invisible to everyone but the owner.
    await this.prisma.note.updateMany({
      where: { group_id: groupId, deleted_at: null },
      data: { visibility: 'PRIVATE', group_id: null },
    });

    await this.prisma.group.delete({ where: { id: groupId } });
    return { message: 'group deleted' };
  }

  // Promote member to admin (owner only)
  async promoteToAdmin(requesterId: string, groupId: string, targetUserId: string) {
    await this.assertRole(requesterId, groupId, ['OWNER']);

    const membership = await this.prisma.groupMember.findUnique({
      where: { group_id_user_id: { group_id: groupId, user_id: targetUserId } },
    });
    if (!membership) throw new NotFoundException('Member not found');
    if (membership.role === 'OWNER') throw new BadRequestException('Cannot change owner role');

    return this.prisma.groupMember.update({
      where: { group_id_user_id: { group_id: groupId, user_id: targetUserId } },
      data: { role: 'ADMIN' },
      include: { user: { select: { id: true, username: true, avatar_url: true } } },
    });
  }

  // Helper: get group IDs where user is a member (used by notes service)
  async getMemberGroupIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { user_id: userId },
      select: { group_id: true },
    });
    return memberships.map((m) => m.group_id);
  }

  // Guards

  private async assertMember(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const membership = await this.prisma.groupMember.findUnique({
      where: { group_id_user_id: { group_id: groupId, user_id: userId } },
    });
    if (!membership) throw new ForbiddenException('Not a group member');
    return membership;
  }

  private async assertRole(
    userId: string,
    groupId: string,
    allowedRoles: Array<'OWNER' | 'ADMIN' | 'MEMBER'>,
  ) {
    const membership = await this.assertMember(userId, groupId);
    if (!allowedRoles.includes(membership.role as 'OWNER' | 'ADMIN' | 'MEMBER')) {
      throw new ForbiddenException('Insufficient group role');
    }
    return membership;
  }
}
