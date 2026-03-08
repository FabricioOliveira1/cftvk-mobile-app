import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
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

export async function cancelReservation(reservationId: string): Promise<void> {
  await deleteDoc(doc(db, 'reservations', reservationId));
}

export async function createReservation(
  classId: string,
  userId: string,
  classDate?: string,
  classTime?: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'reservations'), {
    classId,
    userId,
    status: 'BOOKED',
    ...(classDate && { classDate }),
    ...(classTime && { classTime }),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Verifica se o usuário já tem (ou teve) uma reserva em um determinado dia.
 * - null: nenhuma reserva no dia (cancelamentos deletam o doc, então não aparecem)
 * - { classTime }: já possui reserva — classTime permite distinguir se a aula já passou
 */
export async function getUserDayReservationStatus(
  userId: string,
  classDate: string
): Promise<{ classTime?: string } | null> {
  const q = query(
    collection(db, 'reservations'),
    where('userId', '==', userId),
    where('classDate', '==', classDate)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { classTime: snap.docs[0].data().classTime as string | undefined };
}

/**
 * Busca uma página do histórico de reservas do usuário (aulas já encerradas).
 * Ordenado por classDate DESC. Usar `lastDoc` para paginar.
 * Filtragem de aulas do dia atual (classDate == hoje) deve ser feita pelo cliente
 * usando isPastClass() pois Firestore não suporta filtro em dois campos ao mesmo tempo sem índice extra.
 */
export async function getHistoryPage(
  userId: string,
  pageSize: number,
  lastDoc?: DocumentSnapshot
): Promise<{ docs: QueryDocumentSnapshot[]; lastDoc: DocumentSnapshot | null }> {
  const today = new Date().toISOString().split('T')[0];

  const baseConstraints = [
    where('userId', '==', userId),
    where('classDate', '<=', today),
    orderBy('classDate', 'desc'),
    limit(pageSize),
  ];

  const q = lastDoc
    ? query(collection(db, 'reservations'), ...baseConstraints, startAfter(lastDoc))
    : query(collection(db, 'reservations'), ...baseConstraints);

  const snap = await getDocs(q);

  return {
    docs: snap.docs,
    lastDoc: snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null,
  };
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
