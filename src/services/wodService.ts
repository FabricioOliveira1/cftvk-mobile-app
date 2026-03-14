import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Session, Wod } from '../types';

export async function getWodByDate(date: string): Promise<Wod | null> {
  const snap = await getDoc(doc(db, 'wods', date));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Wod;
}

export async function setWodForDate(
  date: string,
  sessions: Session[],
  userId: string
): Promise<void> {
  await setDoc(doc(db, 'wods', date), {
    date,
    sessions,
    createdBy: userId,
    updatedAt: serverTimestamp(),
  });
}
