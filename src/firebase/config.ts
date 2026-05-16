import Constants from 'expo-constants';

import type { FirebaseClientConfig } from './types';

type ExpoFirebaseExtra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
};

function readExtra(): ExpoFirebaseExtra {
  const extra = Constants.expoConfig?.extra as ExpoFirebaseExtra | undefined;
  return extra ?? {};
}

function requireConfigValue(
  key: keyof FirebaseClientConfig,
  value: string | undefined,
): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing Firebase config: ${key}. Copy .env.example to .env and set EXPO_PUBLIC_FIREBASE_* values.`,
    );
  }
  return value.trim();
}

export function getFirebaseConfig(): FirebaseClientConfig {
  const extra = readExtra();

  return {
    apiKey: requireConfigValue('apiKey', extra.firebaseApiKey),
    authDomain: requireConfigValue('authDomain', extra.firebaseAuthDomain),
    projectId: requireConfigValue('projectId', extra.firebaseProjectId),
    storageBucket: requireConfigValue(
      'storageBucket',
      extra.firebaseStorageBucket,
    ),
    messagingSenderId: requireConfigValue(
      'messagingSenderId',
      extra.firebaseMessagingSenderId,
    ),
    appId: requireConfigValue('appId', extra.firebaseAppId),
  };
}

export function isFirebaseConfigured(): boolean {
  const extra = readExtra();
  return Boolean(
    extra.firebaseApiKey?.trim() &&
      extra.firebaseProjectId?.trim() &&
      extra.firebaseAppId?.trim(),
  );
}
