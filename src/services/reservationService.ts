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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from './firebase';
import { Reservation } from '../types';

const functions = getFunctions();

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

/**
 * Check-in do aluno via Cloud Function.
 * Valida server-side que a janela (até classStart + 15min) ainda está aberta.
 * Lança HttpsError 'failed-precondition' com message 'check_in_window_expired' se expirou.
 */
export async function callCheckIn(reservationId: string): Promise<void> {
  await httpsCallable(functions, 'checkIn')({ reservationId });
}

/**
 * Check-in pelo admin via Cloud Function — sem restrição de tempo.
 */
export async function callAdminCheckIn(reservationId: string): Promise<void> {
  await httpsCallable(functions, 'adminCheckIn')({ reservationId });
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
 * Conta quantas reservas ativas (status BOOKED e aula ainda não passou) o usuário possui.
 * Usa classDate/classTime denormalizados para evitar buscar cada aula separadamente.
 * Mantém filtro de data client-side pois o scheduler tem latência de até 15 min.
 */
export async function getUserActiveReservationCount(userId: string): Promise<number> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const q = query(
    collection(db, 'reservations'),
    where('userId', '==', userId),
    where('status', '==', 'BOOKED')
  );
  const snap = await getDocs(q);

  return snap.docs.filter((d) => {
    const data = d.data();
    if (!data.classDate) return true; // conservador: conta se data desconhecida
    if (data.classDate > today) return true; // aula futura
    if (data.classDate === today) {
      if (!data.classTime) return true; // conservador: conta se hora desconhecida
      return data.classTime >= currentTime;
    }
    return false; // aula já passou
  }).length;
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
