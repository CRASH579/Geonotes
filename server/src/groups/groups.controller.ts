import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('groups')
@ApiBearerAuth('firebase-jwt')
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  create(@Req() req, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List groups I am a member of' })
  getMyGroups(@Req() req) {
    return this.groupsService.getMyGroups(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details with member list' })
  getGroup(@Req() req, @Param('id') id: string) {
    return this.groupsService.getGroup(req.user.id, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to the group by username' })
  addMember(@Req() req, @Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.groupsService.addMember(req.user.id, id, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the group (or leave)' })
  removeMember(
    @Req() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.groupsService.removeMember(req.user.id, id, userId);
  }

  @Patch(':id/members/:userId/promote')
  @ApiOperation({ summary: 'Promote a member to admin (owner only)' })
  promoteToAdmin(
    @Req() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.groupsService.promoteToAdmin(req.user.id, id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete the group (owner only)' })
  deleteGroup(@Req() req, @Param('id') id: string) {
    return this.groupsService.deleteGroup(req.user.id, id);
  }
}
