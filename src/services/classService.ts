import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Class, NewClassPayload } from '../types';

export async function getClassesByDate(date: string): Promise<Class[]> {
  const q = query(collection(db, 'classes'), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Class));
}

export async function createClass(
  createdBy: string,
  payload: NewClassPayload
): Promise<string> {
  const ref = await addDoc(collection(db, 'classes'), {
    ...payload,
    createdBy,
  });
  return ref.id;
}

export async function updateClass(
  id: string,
  payload: Partial<NewClassPayload>
): Promise<void> {
  await updateDoc(doc(db, 'classes', id), payload);
}

export async function deleteClass(id: string): Promise<void> {
  await deleteDoc(doc(db, 'classes', id));
}

export async function getMemberCount(): Promise<number> {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.size;
}

export async function getClassCountForToday(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const q = query(collection(db, 'classes'), where('date', '==', today));
  const snap = await getDocs(q);
  return snap.size;
}
