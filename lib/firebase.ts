// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "unervote",
  "appId": "1:180061893573:web:e820f333955deb30a311ac",
  "storageBucket": "unervote.firebasestorage.app",
  "apiKey": "AIzaSyDsGeHGy8aWUqchsSwwiRNjnDJBUVBZu6E",
  "authDomain": "unervote.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "180061893573"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;
