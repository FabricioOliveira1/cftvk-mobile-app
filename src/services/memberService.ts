import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import { createUserProfile } from './userService';
import { AppUser, UserRole } from '../types';

export async function getMembers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser));
}

export async function getCoaches(): Promise<AppUser[]> {
  const q = query(collection(db, 'users'), where('role', '==', 'coach'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser));
}

export async function updateMember(
  uid: string,
  data: Partial<Omit<AppUser, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function deleteMember(uid: string): Promise<void> {
  const deleteUser = httpsCallable(functions, 'deleteUser');
  await deleteUser({ uid });
}

export async function createMember(
  name: string,
  email: string,
  role: UserRole,
  password: string
): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await createUserProfile(user.uid, { name: name.trim(), email: email.trim(), role });
}
