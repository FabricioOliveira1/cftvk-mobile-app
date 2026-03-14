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

  const { name, email, role, password, planType, enrollmentActive, phone, birthDate } = request.data as {
    name: string;
    email: string;
    role: string;
    password: string;
    planType?: string;
    enrollmentActive?: boolean;
    phone?: string;
    birthDate?: string;
  };

  if (!name || !email || !role || !password) {
    throw new HttpsError('invalid-argument', 'Todos os campos são obrigatórios.');
  }

  // Garante que o role seja apenas 'student' ou 'coach' — nunca 'admin'
  const safeRole = (['student', 'coach'] as string[]).includes(role) ? role : 'student';

  const userRecord = await admin.auth().createUser({ email, password, displayName: name });

  // Define custom claim no token JWT (elimina lookups futuros de role)
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: safeRole });

  const PLAN_DAYS: Record<string, number>   = { mensal: 30, trimestral: 90, semestral: 180 };
  const PLAN_LABELS: Record<string, string> = { mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral' };

  const userData: Record<string, unknown> = {
    name,
    email,
    role: safeRole,
    enrollmentActive: enrollmentActive ?? true,
    mustChangePassword: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ...(phone ? { phone } : {}),
    ...(birthDate ? { birthDate } : {}),
  };

  if (planType && PLAN_DAYS[planType]) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PLAN_DAYS[planType]);
    userData.planType     = planType;
    userData.plan         = PLAN_LABELS[planType];
    userData.planExpiresAt = admin.firestore.Timestamp.fromDate(expiresAt);
  }

  await admin.firestore().doc(`users/${userRecord.uid}`).set(userData);
});

// ---------------------------------------------------------------------------
// resetUserPassword — admin: redefine senha e força troca no próximo acesso
// ---------------------------------------------------------------------------

export const resetUserPassword = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { uid, newPassword } = request.data as { uid: string; newPassword: string };
  if (!uid) throw new HttpsError('invalid-argument', 'uid é obrigatório.');
  if (!newPassword || newPassword.length < 6) {
    throw new HttpsError('invalid-argument', 'A senha deve ter no mínimo 6 caracteres.');
  }

  await admin.auth().updateUser(uid, { password: newPassword });
  await admin.firestore().doc(`users/${uid}`).update({ mustChangePassword: true });
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
// updateMemberEnrollment — admin: atualiza planType, planExpiresAt e enrollmentActive
// Campos de matrícula são admin-only — não devem ser alterados via client updateDoc
// ---------------------------------------------------------------------------

export const updateMemberEnrollment = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { uid, planType, enrollmentActive } = request.data as {
    uid: string;
    planType?: string;
    enrollmentActive: boolean;
  };
  if (!uid) throw new HttpsError('invalid-argument', 'uid é obrigatório.');

  const PLAN_DAYS: Record<string, number>   = { mensal: 30, trimestral: 90, semestral: 180 };
  const PLAN_LABELS: Record<string, string> = { mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral' };

  const updateData: Record<string, unknown> = { enrollmentActive };

  if (planType && PLAN_DAYS[planType]) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PLAN_DAYS[planType]);
    updateData.planType     = planType;
    updateData.plan         = PLAN_LABELS[planType];
    updateData.planExpiresAt = admin.firestore.Timestamp.fromDate(expiresAt);
  }

  await admin.firestore().doc(`users/${uid}`).update(updateData);
});

// ---------------------------------------------------------------------------
// deactivateExpiredPlans — Cloud Scheduler diário 02:00 UTC
// Desativa matrícula de alunos cujo planExpiresAt já passou
// Requer índice composto: users (enrollmentActive ASC, planExpiresAt ASC)
// ---------------------------------------------------------------------------

export const deactivateExpiredPlans = onSchedule('0 2 * * *', async () => {
  const now = admin.firestore.Timestamp.now();

  const snap = await admin.firestore()
    .collection('users')
    .where('enrollmentActive', '==', true)
    .where('planExpiresAt', '<=', now)
    .get();

  if (snap.empty) return;

  const batch = admin.firestore().batch();
  snap.docs.forEach((d) => batch.update(d.ref, { enrollmentActive: false }));
  await batch.commit();
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
