import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from './firebase';

export async function uploadProfilePhoto(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profile-photos/${userId}`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  await updateDoc(doc(db, 'users', userId), { photoURL: url });
  return url;
}
