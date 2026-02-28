import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { PR, PRUnit } from '../types';
import { db } from './firebase';

export async function getUserPRs(userId: string): Promise<PR[]> {
  const q = query(collection(db, 'prs'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const prs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PR));
  return prs.sort((a, b) => {
    const aTime = (a.createdAt as any)?.toDate?.()?.getTime() ?? 0;
    const bTime = (b.createdAt as any)?.toDate?.()?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export async function createPR(
  userId: string,
  movement: string,
  value: string,
  unit: PRUnit
): Promise<string> {
  const ref = await addDoc(collection(db, 'prs'), {
    userId,
    movement,
    value,
    unit,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePR(
  id: string,
  value: string,
  unit: PRUnit
): Promise<void> {
  await updateDoc(doc(db, 'prs', id), { value, unit });
}

export async function deletePR(id: string): Promise<void> {
  await deleteDoc(doc(db, 'prs', id));
}
