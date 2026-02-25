import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import serviceAccount from '../../firebase-service-account.json';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    } else {
      this.app = admin.app();
    }
  }

  get auth() {
    return this.app.auth();
  }

  get firestore() {
    return this.app.firestore();
  }
}
