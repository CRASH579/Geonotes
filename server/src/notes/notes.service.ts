import { Injectable } from '@nestjs/common';
import { FirestoreService } from 'src/database/firestore.service';

@Injectable()
export class NotesService {
    constructor(private readonly firestore: FirestoreService) {}

    async getNotes() {
        const snapshot = await this.firestore.collection
        .collection('notes')
        .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    }
}
