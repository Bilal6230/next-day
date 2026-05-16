import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { getFirebaseStorage } from './index';

/**
 * Storage helpers — prepared for future features (avatars, attachments).
 * Paths should stay scoped per user, e.g. users/{uid}/...
 */

export function userStorageRef(uid: string, path: string) {
  const normalized = path.replace(/^\/+/, '');
  return ref(getFirebaseStorage(), `users/${uid}/${normalized}`);
}

export async function uploadUserFile(
  uid: string,
  path: string,
  data: Blob | Uint8Array | ArrayBuffer,
): Promise<string> {
  const fileRef = userStorageRef(uid, path);
  await uploadBytes(fileRef, data);
  return getDownloadURL(fileRef);
}
