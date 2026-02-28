import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export const deleteUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const uid = request.data?.uid as string;
  if (!uid) throw new HttpsError('invalid-argument', 'UID é obrigatório.');

  // Cascade: busca reservas e PRs do usuário antes de deletar
  const db = admin.firestore();
  const [resSnap, prSnap] = await Promise.all([
    db.collection('reservations').where('userId', '==', uid).get(),
    db.collection('prs').where('userId', '==', uid).get(),
  ]);

  // Deleta auth + user doc + todas as reservas e PRs em batch
  await admin.auth().deleteUser(uid);

  const batch = db.batch();
  batch.delete(db.doc(`users/${uid}`));
  resSnap.docs.forEach((d) => batch.delete(d.ref));
  prSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
});

// ---------------------------------------------------------------------------
// updateClass — admin: atualiza aula e sincroniza classDate/classTime nas
// reservas BOOKED quando data ou horário forem alterados
// ---------------------------------------------------------------------------

export const updateClass = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { classId, payload } = request.data as { classId: string; payload: Record<string, unknown> };
  if (!classId || !payload) {
    throw new HttpsError('invalid-argument', 'classId e payload são obrigatórios.');
  }

  const db = admin.firestore();

  // Atualiza o documento da aula
  await db.doc(`classes/${classId}`).update(payload);

  // Se data ou horário mudaram, sincroniza classDate/classTime nas reservas BOOKED
  if (payload.date || payload.time) {
    const resSnap = await db.collection('reservations')
      .where('classId', '==', classId)
      .where('status', '==', 'BOOKED')
      .get();

    if (!resSnap.empty) {
      const syncData: Record<string, unknown> = {};
      if (payload.date) syncData.classDate = payload.date;
      if (payload.time) syncData.classTime = payload.time;

      const batch = db.batch();
      resSnap.docs.forEach((d) => batch.update(d.ref, syncData));
      await batch.commit();
    }
  }
});

// ---------------------------------------------------------------------------
// deleteClass — admin: exclui aula + todas as reservas vinculadas (cascade)
// ---------------------------------------------------------------------------

export const deleteClass = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { classId } = request.data as { classId: string };
  if (!classId) throw new HttpsError('invalid-argument', 'classId é obrigatório.');

  const db = admin.firestore();

  // Busca todas as reservas desta aula
  const resSnap = await db.collection('reservations').where('classId', '==', classId).get();

  // Deleta aula + reservas em um único batch
  const batch = db.batch();
  batch.delete(db.doc(`classes/${classId}`));
  resSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
});

export const createUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { name, email, password, role } = request.data as {
    name: string;
    email: string;
    password: string;
    role: string;
  };

  if (!name || !email || !password || !role) {
    throw new HttpsError('invalid-argument', 'Todos os campos são obrigatórios.');
  }

  // Garante que o role seja apenas 'student' ou 'coach' — nunca 'admin'
  const safeRole = (['student', 'coach'] as string[]).includes(role) ? role : 'student';

  const userRecord = await admin.auth().createUser({ email, password, displayName: name });

  // Define custom claim no token JWT (elimina lookups futuros de role)
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: safeRole });

  await admin.firestore().doc(`users/${userRecord.uid}`).set({
    name,
    email,
    role: safeRole,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// ---------------------------------------------------------------------------
// checkIn — aluno: valida janela de 15 min após início da aula (server-side)
// ---------------------------------------------------------------------------

export const checkIn = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const { reservationId } = request.data as { reservationId: string };
  if (!reservationId) throw new HttpsError('invalid-argument', 'reservationId é obrigatório.');

  const ref = admin.firestore().doc(`reservations/${reservationId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Reserva não encontrada.');

  const data = snap.data()!;

  if (data.userId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'Acesso negado.');
  }

  if (data.status !== 'BOOKED') {
    throw new HttpsError('failed-precondition', 'Reserva não está no estado BOOKED.');
  }

  const { classDate, classTime } = data;
  if (!classDate || !classTime) {
    throw new HttpsError('failed-precondition', 'Dados de data/hora da aula ausentes na reserva.');
  }

  const [y, m, d] = (classDate as string).split('-').map(Number);
  const [h, min] = (classTime as string).split(':').map(Number);
  const deadline = new Date(y, m - 1, d, h, min + 15, 0);

  if (new Date() > deadline) {
    throw new HttpsError('failed-precondition', 'check_in_window_expired');
  }

  await ref.update({
    status: 'CHECKED_IN',
    checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// ---------------------------------------------------------------------------
// adminCheckIn — admin: sem restrição de tempo (override manual)
// ---------------------------------------------------------------------------

export const adminCheckIn = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { reservationId } = request.data as { reservationId: string };
  if (!reservationId) throw new HttpsError('invalid-argument', 'reservationId é obrigatório.');

  const ref = admin.firestore().doc(`reservations/${reservationId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Reserva não encontrada.');

  await ref.update({
    status: 'CHECKED_IN',
    checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// ---------------------------------------------------------------------------
// markNoShows — Cloud Scheduler: marca reservas BOOKED expiradas como NO_SHOW
// ---------------------------------------------------------------------------

export const markNoShows = onSchedule('every 15 minutes', async () => {
  const now = new Date();
  const noShowTs = admin.firestore.Timestamp.fromDate(now);
  const todayStr = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Filtra apenas reservas passadas (classDate <= hoje) para limitar leituras
  const snap = await admin.firestore()
    .collection('reservations')
    .where('status', '==', 'BOOKED')
    .where('classDate', '<=', todayStr)
    .get();

  const batch = admin.firestore().batch();
  let count = 0;

  for (const docSnap of snap.docs) {
    const { classDate, classTime } = docSnap.data();
    if (!classDate || !classTime) continue;

    const [y, m, d] = (classDate as string).split('-').map(Number);
    const [h, min] = (classTime as string).split(':').map(Number);
    const deadline = new Date(y, m - 1, d, h, min + 15, 0);

    if (now > deadline) {
      batch.update(docSnap.ref, { status: 'NO_SHOW', noShowAt: noShowTs });
      count++;
    }

    if (count === 500) break; // limite do batch do Firestore
  }

  if (count > 0) await batch.commit();
});

// ---------------------------------------------------------------------------
// syncAllUserClaims — executar UMA vez para sincronizar custom claims nos usuários existentes
// Após executar, o token JWT de cada usuário conterá { role } sem precisar de leitura do Firestore
// ---------------------------------------------------------------------------

export const syncAllUserClaims = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const snap = await admin.firestore().collection('users').get();
  let synced = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (!data.role) continue;
    await admin.auth().setCustomUserClaims(docSnap.id, { role: data.role });
    synced++;
  }

  return { synced };
});

// ---------------------------------------------------------------------------
// migrateReservations — executar UMA vez após deploy para converter docs antigos
// (checkedIn: boolean → status: ReservationStatus)
// ---------------------------------------------------------------------------

export const migrateReservations = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const snap = await admin.firestore().collection('reservations').get();
  const batch = admin.firestore().batch();
  let migrated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.status) continue; // já migrado
    const newStatus = data.checkedIn ? 'CHECKED_IN' : 'BOOKED';
    batch.update(docSnap.ref, { status: newStatus });
    migrated++;
  }

  if (migrated > 0) await batch.commit();
  return { migrated };
});
