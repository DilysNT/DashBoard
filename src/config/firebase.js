// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA31qEf8Ermj7KxmrUvRJzcqCjYAVnHuhk",
  authDomain: "web-3f127.firebaseapp.com",
  projectId: "web-3f127",
  storageBucket: "web-3f127.appspot.com",
  messagingSenderId: "162306370244",
  appId: "1:162306370244:web:0240618b9749a9613d3791",
  measurementId: "G-13VTG8PENL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Messaging (for push notifications)
export const messaging = getMessaging(app);

// Development mode emulators (uncomment if using Firebase emulators)
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
