import * as admin from 'firebase-admin'

import serviceAccount from "../../firebase-service-account.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: 'https://geonotes-8424e-default-rtdb.firebaseio.com',
  });
}

export { admin };