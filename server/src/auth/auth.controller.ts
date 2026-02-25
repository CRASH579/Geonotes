import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Firebase ID token. Creates user if not exists.' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async login(@Body() body: LoginDto) {
    if (!body.idToken) {
        throw new UnauthorizedException('idToken is required');
    }
    return this.authService.login(body.idToken);
  }
}
