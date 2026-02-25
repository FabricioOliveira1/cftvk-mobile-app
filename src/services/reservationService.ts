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
import { db } from './firebase';
import { Reservation } from '../types';

export async function getReservationsByClass(classId: string): Promise<Reservation[]> {
  const q = query(
    collection(db, 'reservations'),
    where('classId', '==', classId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation));
}

export async function getReservationCount(classId: string): Promise<number> {
  const q = query(
    collection(db, 'reservations'),
    where('classId', '==', classId)
  );
  const snap = await getDocs(q);
  return snap.size;
}

export async function checkInReservation(reservationId: string): Promise<void> {
  await updateDoc(doc(db, 'reservations', reservationId), { checkedIn: true });
}

export async function cancelReservation(reservationId: string): Promise<void> {
  await deleteDoc(doc(db, 'reservations', reservationId));
}

export async function createReservation(
  classId: string,
  userId: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'reservations'), {
    classId,
    userId,
    checkedIn: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserReservationForClass(
  classId: string,
  userId: string
): Promise<Reservation | null> {
  const q = query(
    collection(db, 'reservations'),
    where('classId', '==', classId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Reservation;
}
