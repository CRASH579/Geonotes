import { Injectable } from '@nestjs/common';
import { admin } from '../firebase/firebase-admin';

@Injectable()
export class FirestoreService {
  private db = admin.firestore();

  get collection() {
    return this.db;
  }
}
