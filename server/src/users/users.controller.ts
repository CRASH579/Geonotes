import { Controller, Get, Patch, Req, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('check-username')
  @ApiOperation({ summary: 'Check if a username is available (public)' })
  @ApiQuery({ name: 'username', required: true })
  @ApiResponse({ status: 200, schema: { example: { available: true } } })
  async checkUsername(@Query('username') username: string) {
    if (!username || username.length < 3) return { available: false };
    const available = await this.usersService.isUsernameAvailable(username);
    return { available };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('firebase-jwt')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getProfile(@Req() req: Express.Request & { user: UserResponseDto }) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('firebase-jwt')
  @ApiOperation({ summary: 'Update current user username' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateProfile(
    @Req() req: Express.Request & { user: UserResponseDto },
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(req.user.id, body.username);
  }
}
