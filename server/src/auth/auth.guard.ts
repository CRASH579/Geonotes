import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebase.auth.verifyIdToken(token);
      
      let user = await this.usersService.findByFirebaseUid(decodedToken.uid);
      
      // We expect the user to be created via /auth/login first, but if valid token we could also auto-create
      // For strict flow, they should login. If they just supply valid token but no profile, fail or auto-create.
      if (!user) {
        throw new UnauthorizedException('User profile not found. Call /api/auth/login first.');
      }

      request.user = user;
      request.firebaseToken = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Unauthorized: ${error.message}`);
    }
  }
}
