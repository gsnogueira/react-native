export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCsMfBDehzxj3qMTuZszebjdqYVHBz9hZk',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'react-native-28557.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://react-native-28557-default-rtdb.firebaseio.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'react-native-28557',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'react-native-28557.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '46403162733',
  appId: process.env.FIREBASE_APP_ID || '1:46403162733:web:e5c0c265e852c1071e6564',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-DD2D5F2401',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
