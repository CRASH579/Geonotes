import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async login(idToken: string) {
    try {
      const decodedUser = await this.firebase.auth.verifyIdToken(idToken);
      
      const { uid, email, name, picture } = decodedUser;

      // Extract username from email if name is missing or invalid
      let username = name || email?.split('@')[0] || `user_${uid.slice(0, 5)}`;
      
      // If the email is missing, we fail
      if (!email) {
          throw new UnauthorizedException('Firebase token missing email');
      }

      // Upsert the user into PostgreSQL
      const user = await this.usersService.upsertUser(uid, email, username, picture);

      return user;
    } catch (error) {
      throw new UnauthorizedException(`Invalid Firebase token: ${error.message}`);
    }
  }
}
