import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Req,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SendRequestDto } from './dto/send-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('friends')
@ApiBearerAuth('firebase-jwt')
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request by username' })
  sendRequest(@Req() req, @Body() dto: SendRequestDto) {
    return this.friendsService.sendRequest(req.user.id, dto);
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Accept or reject a friend request' })
  respond(@Req() req, @Param('id') id: string, @Body() dto: RespondRequestDto) {
    return this.friendsService.respond(req.user.id, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get accepted friends list' })
  getAccepted(@Req() req) {
    return this.friendsService.getAcceptedFriends(req.user.id);
  }

  @Get('pending/received')
  @ApiOperation({ summary: 'Get incoming pending friend requests' })
  getPendingReceived(@Req() req) {
    return this.friendsService.getPendingReceived(req.user.id);
  }

  @Get('pending/sent')
  @ApiOperation({ summary: 'Get outgoing pending friend requests' })
  getPendingSent(@Req() req) {
    return this.friendsService.getPendingSent(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove or cancel a friendship' })
  remove(@Req() req, @Param('id') id: string) {
    return this.friendsService.remove(req.user.id, id);
  }
}
