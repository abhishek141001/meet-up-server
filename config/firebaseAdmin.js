// config/firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from '../lets-meet-8288c-firebase-adminsdk-fn5iq-7403719dab.json' assert { type: 'json' }; // Use assert for JSON in ESM

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

});

export default admin;
