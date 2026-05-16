import { Timestamp } from 'firebase/firestore';

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type UserProfile = {
  email: string;
  displayName: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateUserProfileInput = {
  email: string;
  displayName: string;
};
