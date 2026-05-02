import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

// ── Wellhub secrets (configurar via: firebase functions:secrets:set <NAME>) ──
const wellhubAuthToken = defineSecret('WELLHUB_AUTH_TOKEN');
const wellhubSecretKey = defineSecret('WELLHUB_SECRET_KEY');
const wellhubGymId     = defineSecret('WELLHUB_GYM_ID');
const wellhubClassId   = defineSecret('WELLHUB_CLASS_ID');
const wellhubBaseUrl   = defineSecret('WELLHUB_BASE_URL'); // produção ou sandbox

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

// ---------------------------------------------------------------------------
// seedWorkoutData — admin: popula wods/ e classes/ a partir de agenda fixa
// Idempotente: deleta e recria aulas/reservas dos dias afetados a cada execução
// ---------------------------------------------------------------------------

const COACH_SCHEDULE: Record<number, { time: string; coach: string }[]> = {
  1: [ // Segunda — Thayan
    { time: '06:00', coach: 'Thayan' }, { time: '08:00', coach: 'Thayan' },
    { time: '09:00', coach: 'Thayan' }, { time: '15:00', coach: 'Thayan' },
    { time: '18:00', coach: 'Thayan' }, { time: '19:00', coach: 'Thayan' },
    { time: '20:00', coach: 'Thayan' },
  ],
  2: [ // Terça — Julio Souza + Caio Cezar
    { time: '06:00', coach: 'Julio Souza' }, { time: '08:00', coach: 'Julio Souza' },
    { time: '09:00', coach: 'Julio Souza' }, { time: '15:00', coach: 'Caio Cezar' },
    { time: '18:00', coach: 'Julio Souza' }, { time: '19:00', coach: 'Julio Souza' },
    { time: '20:00', coach: 'Julio Souza' },
  ],
  3: [ // Quarta — Everton + Caio Cezar + Tatiana
    { time: '06:00', coach: 'Everton' }, { time: '08:00', coach: 'Everton' },
    { time: '09:00', coach: 'Everton' }, { time: '15:00', coach: 'Caio Cezar' },
    { time: '18:00', coach: 'Tatiana' }, { time: '19:00', coach: 'Tatiana' },
    { time: '20:00', coach: 'Tatiana' },
  ],
  4: [ // Quinta — Julio Souza + Caio Cezar
    { time: '06:00', coach: 'Julio Souza' }, { time: '08:00', coach: 'Julio Souza' },
    { time: '09:00', coach: 'Julio Souza' }, { time: '15:00', coach: 'Caio Cezar' },
    { time: '18:00', coach: 'Julio Souza' }, { time: '19:00', coach: 'Julio Souza' },
    { time: '20:00', coach: 'Julio Souza' },
  ],
  5: [ // Sexta — Everton + Caio Cezar + Jansen
    { time: '06:00', coach: 'Everton' }, { time: '08:00', coach: 'Everton' },
    { time: '09:00', coach: 'Everton' }, { time: '15:00', coach: 'Caio Cezar' },
    { time: '18:00', coach: 'Jansen' }, { time: '19:00', coach: 'Jansen' },
    { time: '20:00', coach: 'Jansen' },
  ],
  6: [ // Sábado — Caio Cezar
    { time: '09:00', coach: 'Caio Cezar' },
  ],
};

interface WorkoutEntry {
  date: string;
  title: string;
  sessions: { id: string; title: string; details: string }[];
}

const WORKOUT_DATA: WorkoutEntry[] = [
  {
    date: '2026-02-23', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Perna Aberta em Pé\n30'' Mão Em Cada Pé\n30'' PVC Pass\n\n\n2 Rounds Of\n5 Deadlifts\n5 Hang Cleans\n5 Shoulder Press\n10 Ring Row\n\n\nForça - Squat Snatch\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%` },
      { id: '2', title: 'Deadlift', details: `Passo a Passo Guiado\n\n\nPegada do clean, pegada do snatch, pegada sumo` },
      { id: '3', title: "For Time 5'", details: `Rx\n\n\n3 Rounds Of\n100m Run\n8 Power Cleans (60/45)\n\n\nIntermediario\n\n\n3 Rounds Of\n100m Run\n8 Power Cleans (50/35)\n\n\nScaled\n\n\n3 Rounds Of\n100m Run\n8 Power Cleans` },
    ],
  },
  {
    date: '2026-02-24', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando\n30'' Deitado No Ombro\n\n\n10 Air Squats\n10 Lunges\n5 Burpees\n\n\nForça - Biceps\n\n\n4 Rounds Of\n12 Biceps Diretos\n20'' Iso Biceps` },
      { id: '2', title: 'Rope Climb', details: `Passo a Passo Guiado Pelo Coach\n\n\nQuem já faz\n\n\nEmon 12'\n\n\n1- 3 Rope climb\n2- 10 Pull ups\n3- Rest` },
      { id: '3', title: "Emom 12'", details: `Rx\n\n\n1 - 20 Wall Balls (20/14)\n2 - 20 Mb Lunges\n3 - 12 Burpees OT Ball\n\n\nIntermediario\n\n\n1 - 20 Wall Balls (16/12)\n2 - 20 Mb Lunges\n3 - 12 Burpees OT Ball\n\n\nScaled\n\n\n1 - 20 Wall Balls\n2 - 20 Mb Lunges\n3 - 12 Burpees OT Ball` },
    ],
  },
  {
    date: '2026-02-25', title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\nAquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não tem` },
      { id: '3', title: "Amrap 30'", details: `Rx\n\n\n10 Deadlifts (60/45)\n12 BOTB\n30 D.U.\n10 Cleans\n12 BOTB\n30 D.U.\n10 Jerks\n12 BOTB\n30 D.U.\n\n\nIntermediario\n\n\n10 Deadlifts (50/35)\n12 BOTB\n30 D.U.\n10 Cleans\n12 BOTB\n30 D.U.\n10 Jerks\n12 BOTB\n30 D.U.\n\n\nScaled\n\n\n10 Deadlifts\n12 BOTB\n60 S.U.\n10 Cleans\n12 BOTB\n60 S.U.\n10 Jerks\n12 BOTB\n60 S.U.` },
    ],
  },
  {
    date: '2026-02-26', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Mão Na Parede\n30'' Sentado No Calcanhar\n15 Giros de Ombro Cada Lado\n\n\n10 Air Squats\n10 Push Ups\n30 Polichinelos\n\n\nForça - Split Jerk\n\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%` },
      { id: '2', title: 'Wall Ball', details: `Karen Tc 10'` },
      { id: '3', title: "Amrap 12'", details: `RX\n\n\n50 D.U.\n10 Box Jumps\n10 HSPU\n\n\nScaled\n\n\n100 S.U.\n10 Box Jumps\n10 HSPU` },
    ],
  },
  {
    date: '2026-02-27', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n30'' Cotovelo Na Parede\n\n\n2 Rounds Of\n\n\n50m Run\n10 Sit Ups\n\n\nForça - Biceps\n\n\n4 Rounds Of\n6 Biceps Inversos\n4 Rope Pull No Esquadro` },
      { id: '2', title: 'Rope Climb', details: `Passo a Passo Subida para quem fez 1 clip sozinho\n\n\nQuem já faz e quem não fez\n\n\nAmrap 12'\n\n\n50m Sprint\n1 Rope Climb / 3 tentativas de clip` },
      { id: '3', title: "Emom 4'", details: `Categoria Única\n\n\n1 - 150m MB Run\n2 - 50 Escaladores` },
    ],
  },
  {
    date: '2026-02-28', title: '4º',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento` },
      { id: '2', title: 'Skill', details: `-` },
      { id: '3', title: 'Holbrook', details: `RX\n\n\n10 Rounds Of\n\n\n5 Thruster (50/35)\n10 Pull Ups\n100m Sprint\n1' Rest\n\n\nScaled\n\n\n10 Rounds Of\n\n\n5 Thruster (40/25)\n20 Ring Row\n100m Sprint\n1' Rest` },
    ],
  },
  {
    date: '2026-03-02', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n30'' Deitado No Ombro Invertido\n\n\n2 Rounds Of\n\n\n5 Deadlifts\n5 Hang Cleans\n5 Burpees\n\n\nForça - Power Clean\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%` },
      { id: '2', title: 'Hang Squat Clean', details: `Time Cap 10'\n\n\n21-15-9\nHang Power Clean\nHSPU` },
      { id: '3', title: "Amrap 4'", details: `Max Burpee Box Jump Over` },
    ],
  },
  {
    date: '2026-03-03', title: 'Gym Day',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado Em OH\n30'' Pesando\n30'' Pé Na Parede\n\n\n2 Rounds Of\n\n\n12 Air Squats\n20 Line Hops\n50m Run\n\n\nForça - Gluteo\n\n\n4 Rounds Of\n12/12 Bulgarian Squats\n12 Elevações Pelvicas` },
      { id: '2', title: 'Pistol', details: `Dia 1 - SURRA DE MOBILIDADE, SÓ MOBILIDADE` },
      { id: '3', title: "For Time 12'", details: `Rx\n\n\n3 Rounds Of\n\n\n8 Power Snatchs (50/35)\n40 Barbell Hops\n200m Run\n\n\nIntermediario\n\n\n3 Rounds Of\n\n\n8 Power Snatchs (40/30)\n40 Barbell Hops\n200m Run\n\n\nScaled\n\n\n3 Rounds Of\n\n\n8 Power Snatchs\n40 Barbell Hops\n200m Run` },
    ],
  },
  {
    date: '2026-03-04', title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\nAquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não Tem` },
      { id: '3', title: "Emom 30'", details: `Rx\n\n\n1 - 10m OH Walking Lunge (22/16)\n2 - 20 Kb Swings\n3 - 10 HSPU\n4 - 12 Burpees\n5 - Rest\n\n\nIntermediario\n\n\n1 - 10m OH Walking Lunge (20/14)\n2 - 20 Kb Swings\n3 - 10 HSPU\n4 - 12 Burpees\n5 - Rest\n\n\nScaled\n\n\n1 - 10m OH Walking Lunge (18/12)\n2 - 20 Kb Swings\n3 - 10 HSPU\n4 - 12 Burpees\n5 - Rest` },
    ],
  },
  {
    date: '2026-03-05', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' PVC Pass\n30'' OH Hold\n30'' Mão Na Parede\n\n\n5 Hang Snatch\n5 OHS\n20 Sit Ups\n\n\nForça - Power Snatch\n\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%` },
      { id: '2', title: 'Front Squat', details: `Emon 9'\n\n\n1- 9 Deadlifts\n2- 5 Hang Clean\n3- 3 Front Squat` },
      { id: '3', title: "Emom 12'", details: `Rx\n\n\n1 - 15 T2B\n2 - 6 Squat Snatchs (60/35)\n3 - Rest\n\n\nIntermediario\n\n\n1 - 15 Knees to Elbow\n2 - 6 Squat Snatchs (50/30)\n3 - Rest\n\n\nScaled\n\n\n1 - 15 Knees High\n2 - 6 Squat Snatchs\n3 - Rest` },
    ],
  },
  {
    date: '2026-03-06', title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando\n30'' Sentado No Calcanhar\n30'' Gluteo No Solo\n\n\n2 Rounds Of\n\n\n10 Air Squats\n10 Lunges\n\n\nForça - Quadriceps\n\n\n4 Rounds Of\n\n\n12 Passadas Pra Trás\n20 Goblet Squats` },
      { id: '2', title: 'Pistol', details: `Passo a Passo, Desenvolvendo o Pistol.\n\n\nTODOS NA PRÁTICA` },
      { id: '3', title: "Emom 6'", details: `Categoria Única\n\n\n1 - 30'' Chair Hold + 10 Jumping Squats` },
    ],
  },
  {
    date: '2026-03-07', title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento` },
      { id: '2', title: 'Skill', details: `-` },
      { id: '3', title: 'WOD', details: `Interativo` },
    ],
  },
  {
    date: '2026-03-09', title: 'LPO',
    sessions: [
      { id: '1', title: 'Mobility + Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando\n30'' Mão No Solo A Frente\n15 Giros de Ombro Cada Lado\n\n\n2 Rounds Of\n\n\n5 Hang Snatchs\n5 Front Squats\n5 Shoulder Press\n5 Burpees\n\n\nPotência - Squat Clean\n\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%` },
      { id: '2', title: 'Hang Power Snatch', details: `Passo a passo` },
      { id: '3', title: "Amrap 10'", details: `Rx\n\n\n3 Thruster ( 50/35 )\n3 BOTB\n\n\nIntermediario\n\n\n3 Thruster ( 40/30 )\n3 BOTB\n\n\nScaled\n\n\n3 Thruster\n3 BOTB` },
    ],
  },
  {
    date: '2026-03-10', title: 'GYM',
    sessions: [
      { id: '1', title: 'Mobility + Warm-up', details: `Mobility + Warm Up\n\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n\n10 Push Ups\n15 Bom Dias Sem Carga\n20 Lunges\n\n\nPotência - Salto Vertical\n\n\n4 Rounds Of\n\n\n1' MB March\n10 Saltos Com Joelho No Peito` },
      { id: '2', title: 'Box Jump Over', details: `Amrap 12'\n\n\n10 Box jump over\n12 Agachamentos com salto\n100m Run` },
      { id: '3', title: "Emom 12'", details: `Rx\n\n\n1 - 8 Double Kb Swings (22/16)\n2 - 12 Suitcase Lunges\n3 - Rest\n\n\nScaled\n\n\n1 - 8 Double Kb Swings (20/14)\n2 - 12 Suitcase Lunges\n3 - Rest` },
    ],
  },
  {
    date: '2026-03-11', title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Liberação Miofascial + Aquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não Tem` },
      { id: '3', title: "Amrap 30'", details: `Duplas 1 faz e 1 descansa\n\n\nRx\n\n\n200 D.U.\n50 Front Squats (70/50)\n50 V-Ups\n30 Burpees\n\n\nScaled\n\n\n200 S.U.\n50 Front Squats\n50 V-Ups\n30 Burpees` },
    ],
  },
  {
    date: '2026-03-12', title: 'LPO',
    sessions: [
      { id: '1', title: 'Mobility + Warm-up', details: `Mobility + Warm Up\n\n\n30'' PVC Pass\n30'' PVC Pass Lateral\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n\n\n5 Shoulder Press\n10 Air Squats\n10 Push Ups\n100m Run\n\n\nPotência - Squat Snatch\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%` },
      { id: '2', title: 'Split Jerk', details: `Passo a passo` },
      { id: '3', title: "For Time 12'", details: `Categoria Única\n\n\n3 Rounds Of\n600m Run\n10 Push Ups\n20 Air Squats` },
    ],
  },
  {
    date: '2026-03-13', title: 'Gym',
    sessions: [
      { id: '1', title: 'Mobility + Warm-up', details: `Mobility + Warm Up\n\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão Na Parede\n\n\n2 Rounds Of\n\n\n10 Cachorros Mancos\n30 Polichinelos\n20 Escaladores\n5 Burpees\n\n\nForça - Panturrilha\n\n\n12 Flexões plantar\n20m Bailarina Walking` },
      { id: '2', title: 'Box Jump', details: `Emon 8'\n\n\n1- 20 Box Jump\n2- 100 S.U` },
      { id: '3', title: "Emom 8'", details: `1 - 50 D.U.\n2 - 50 Escaladores\n3 - 10 Burpees Abroad 1.5m` },
    ],
  },
  {
    date: '2026-03-14', title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento` },
      { id: '2', title: 'Skill', details: `-` },
      { id: '3', title: 'WOD', details: `Kerrie\n\n\n10 round por tempo de:\n\n\n100-m sprint\n5 burpees\n20 sit-ups\n15 push-ups\n100-m sprint\n\n\nRest 2 minutos` },
    ],
  },
  {
    date: '2026-03-16', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n\n\n2 Rounds Of\n5 Deadlifts\n5 Hang Cleans\n5 Front Squats\n5 Shoulder Press\n\n\nPotência - Split Jerk\n2x3- 85%\n2x2- 90%\n4x1- 95%` },
      { id: '2', title: 'Squat Clean', details: `Amrap 10'\n\n\n200m Run\nMax Squat Cleans (80%)` },
      { id: '3', title: "For Time 4' - Fran", details: `Rx\n\n\n21-15-9\nThruster (43/30)\nPull Up\n\n\nIntermediario\n\n\n21-15-9\nThruster (35/25)\nJumping Pull Up\n\n\nScaled\n\n\n21-15-9\nThruster\nRing Row` },
    ],
  },
  {
    date: '2026-03-17', title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Perna Aberta de Pé\n30'' Mão Em Cada Pé\n30'' Bom Dia Sem Carga\n\n\n3 Wall Walks\n5 Deadlifts\n20 Lunges\n20 Sit Ups\n\n\nFortalecimento de Ombro\n4 Rounds Of\n6 Shoulder Press\n6 Around The World Plate` },
      { id: '2', title: 'Handstand Walk', details: `Dia 1 - Passo a Passo, Defesa e Virada Solo` },
      { id: '3', title: "Emom 15'", details: `Rx\n\n\n1 - 12 T2B\n2 - 7 Deadlifts (100/70)\n3 - 20 Jumping Lunges\n\n\nIntermediario\n\n\n1 - 12 Knees to Elbow\n2 - 7 Deadlifts (80/50)\n3 - 20 Jumping Lunges\n\n\nScaled\n\n\n1 - 12 Knees High\n2 - 7 Deadlifts\n3 - 20 Jumping Lunges` },
    ],
  },
  {
    date: '2026-03-18', title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não Tem` },
      { id: '3', title: "For Time 30'", details: `Rx\n\n\n30 Power Cleans (50/35)\n30 Burpees\n30 Front Squats\n30 Burpees\n30 Pull Ups\n30 Burpees\n30 D.U.\n30 Burpees\n30 HSPU\n30 Burpees\n\n\nIntermediario\n\n\n30 Power Cleans (40/25)\n30 Burpees\n30 Front Squats\n30 Burpees\n30 Jumping Pull Ups\n30 Burpees\n60 S.U.\n30 Burpees\n30 HSPU com anilha\n30 Burpee\n\n\nScaled\n\n\n30 Power Cleans (40/25)\n30 Burpees\n30 Front Squats\n30 Burpees\n30 Ring Row\n30 Burpees\n60 S.U.\n30 Burpees\n30 Push ups\n30 Burpee` },
    ],
  },
  {
    date: '2026-03-19', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' PVC Pass\n30'' Agachado Em OH\n30'' Mão Na Parede\n\n\n5 Hang Snatchs\n5 OHS\n10 Burpees\n\n\nPotência - Power Clean - TC 15'\n\n\nPR` },
      { id: '2', title: 'Split Jerk', details: `Emon 9'\n\n\n1- 5 Shoulder Press\n2- 5 Push Press\n3-  Split Jerk` },
      { id: '3', title: "For Time 12'", details: `Rx\n\n\n12-11-10-9-8-7-6-5-4-3-2-1\n\n\nBurpee Box Jump Over\nKb Snatch (22/16)\nKb OHS\n\n\nScaled\n\n\n12-11-10-9-8-7-6-5-4-3-2-1\n\n\nBurpee Step up  Over\nKb Snatch (20/14)\nKb OHS` },
    ],
  },
  {
    date: '2026-03-20', title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Mão Na Parede\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n\n\n2 Rounds Of\n\n\n3 Wall Walks\n10 Saltos Com Joelho No Peito\n20 Sit Ups\n\n\nCore\n4 Rounds Of\n1' Hollow Position\n15 Hollow Rocks` },
      { id: '2', title: 'Handstand Walk', details: `Dia 2 - Passo a Passo Avançado Pra Quem Já Vira Sozinho\n\n\nOu\n\n\nRx/ Condicionamento\n\n\nEmom 12'\n1 - 10m HSW / 100m Sprint\n2 - 15 Back Extension\n3 - Rest` },
      { id: '3', title: "Emom 4'", details: `RX\n\n\n1 - 20 Box Jumps\n2 - 15 T2B\n\n\nScaled\n\n\n1 - 20 Step up\n2 - 15 Knees high` },
    ],
  },
  {
    date: '2026-03-21', title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento` },
      { id: '2', title: 'Skill', details: `-` },
      { id: '3', title: 'WOD', details: `Interativo` },
    ],
  },
  {
    date: '2026-03-23', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n30'' Mão No Solo\n\n\n2 Rounds Of\n5 Hang Snatchs\n5 OHS\n30 Polichinelos\n\n\nForça - Power Snatch - Tc 15'\n\n\nPR` },
      { id: '2', title: 'Sumo Deadlift High Pull', details: `Passo a Passo sem peso e com peso baixo` },
      { id: '3', title: "Amrap 8'", details: `Rx\n1-2-3-4-5-6-7-8-9-...\nSDHP (60/45)\n10x D.U\n\n\nScaled\n1-2-3-4-5-6-7-8-9-...\nSDHP (50/35)\n10x S.U` },
    ],
  },
  {
    date: '2026-03-24', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando Com Kb\n12 Toques No Pé Sentado\n\n\n20 Sit Ups\n20 Lunges\n\n\nCore\n4 Rounds Of\n12 V-Ups Alt + Sim\n12 Ciclying Abs` },
      { id: '2', title: 'T2B', details: `For Time 10'\n\n\n5 Rounds Of\n10 T2B\n4 Wall Walks` },
      { id: '3', title: "Emom 12'", details: `Rx\n\n\n1 - 12 Kb Step Ups (22/16)\n2 - 12 Suitcase Reverse Lunge (R-Arm)\n3 - 12 Suitcase Reverse Lunge (L-Arm)` },
    ],
  },
  {
    date: '2026-03-25', title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não Tem` },
      { id: '3', title: "Amrap 30'", details: `Rx\n\n\n100m Buddy Carry\n30 Front Squats (60/45)\n20 BOTB Sync\n30 Deadlifts\n20 Push Ups Sync\n30 Push Jerks\n30 Air Squats Sync\n\n\nScaled\n\n\n100m MB Run\n30 Front Squats (50/35)\n20 BOTB Sync\n30 Deadlifts\n20 Push Ups Sync\n30 Push Jerks\n30 Air Squats Sync` },
    ],
  },
  {
    date: '2026-03-26', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Perna Aberta\n30'' Mão Em Cada Pé\n30'' PVC Pass\n\n\n5 Deadlifts\n5 Hang Clean\n5 Shoulder Press\n3 Wall Walks\n\n\nPotência - Squat Clean - TC 15'\n\n\nPR` },
      { id: '2', title: 'Squat Clean', details: `Passo a Passo` },
      { id: '3', title: "For Time 15'", details: `Rx\n\n\n5 Rounds Of\n12 Kb Clean And Jerks (22/16)\n10m HSW\n12 Wall Balls (20/14)\n\n\nIntermediario\n\n\n5 Rounds Of\n12 Kb Clean And Jerks (20/14)\n10m HSW\n12 Wall Balls (16/12)\n\n\nScaled\n\n\n5 Rounds Of\n12 Kb Clean And Jerks\n6  Wall Walk\n12 Wall Balls` },
    ],
  },
  {
    date: '2026-03-27', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30'' Agachado\n30'' Pesando\n30'' Punho No Solo\n30'' PVC Pass\n\n\n2 Rounds Of\n5 Front Squats\n10 Ring Row\n10 Saltos Com Joelho No Peito\n\n\nFortalecimento de Ombro\n4 Rounds Of\n20 Toques No Ombro Em Prancha\n12 Tiger Bend` },
      { id: '2', title: 'Rope Climb', details: `Amrap 10'\n20 Escaladores\n30 Polichinelos\n1 Rope Climb` },
      { id: '3', title: "Emom 6'", details: `Rx\n\n\n1 - 6 Thrusters (50/35)\n2 - 10 Pull Ups\n3 - 15 Box Jumps\n4 - Rest\n\n\nIntermediario\n\n\n1 - 6 Thrusters (40/30)\n2 - 10 Jumping Pull Ups\n3 - 15 Box Jumps\n4 - Rest\n\n\nScaled\n\n\n1 - 6 Thrusters\n2 - 10 Ring Row\n3 - 15 Step ups\n4 - Rest` },
    ],
  },
  {
    date: '2026-03-28', title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Aquecimento` },
      { id: '2', title: 'Skill', details: `-` },
      { id: '3', title: 'Jag 28', details: `For Time 30'\n\n\n800m Run\n28 Kb Swings (32/22)\n28 Strict Pull Ups\n28 Double Kb Clean And Jerk\n28 Strict Pull Ups\n800m Run` },
    ],
  },
  {
    date: '2026-03-30', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30" Elevando Cotovelo na Barra\n30" Empurrando Perna do Colega deitado\n30" Empurrando Sit Up Deitado\n\n\n2 Rounds of\n\n\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n100m Run\n\n\nForça - Squat Snatch - TC 15'\n\n\nPR` },
      { id: '2', title: 'Hang Squat Clean', details: `Time Cap 6'\n\n\npra maior carga do complex\n\n\n1 hang squat Clean\n1 Front squat\n1 hang squat clean` },
      { id: '3', title: "Emom 9'", details: `RX\n\n\n1 - 6 Clean and Jerks (70/50)\n2 - 12 Burpees Over the Bar\n3 - 150m Sprint\n\n\nScaled\n\n\n1 - 6 Clean and Jerks (60/40)\n2 - 12 Burpees Over the Bar\n3 - 150m Sprint` },
    ],
  },
  {
    date: '2026-03-31', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30" Mão Na Parede\n30" Puxando PVC do Colega\n15 Giros de Ombro cada Direção\n\n\n10 Agachamentos Com Salto\n10 Ring Row\n1' Front Plank\n\n\nPotência - Salto\n\n\n4 Rounds of\n12 Sitted Box Jump\n12 Drop to Jump` },
      { id: '2', title: 'Bar Muscle Up', details: `Dia 1 - Passo a Passo guiado até BMU da caixa` },
      { id: '3', title: "Amrap 12'", details: `RX\n\n\n20 V-Ups Alternados\n12 Double Kb Push Press (22/16)\n12 HSPU\n\n\nIntermediário\n\n\n20 V-Ups Alternados\n12 Double Kb Push Press (20/14)\n12 HSPU com anilha\n\n\nScaled\n\n\n20 V-Ups Alternados\n12 Double Kb Push Press\n12 Push Up` },
    ],
  },
  {
    date: '2026-04-01', title: 'Meticon',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Liberação Miofascial + Aquecimento Especifico` },
      { id: '2', title: 'Skill', details: `Não tem` },
      { id: '3', title: "Emom 30'", details: `RX\n\n\nA cada 9' Por 30'\n\n\n600m Run\n12 Push Jerks (60/40)\n12 Burpees Over The Bar\n12 Box Jump Overs\n100m Farm Walk (40/24)\n12 Russian Kb Swings\n\n\nRest 1' Entre` },
    ],
  },
  {
    date: '2026-04-02', title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n30" PVC Pass\n30" Mão No Solo a Frente\n12 Toques de Ombro no Solo\n\n\n5 Hang Clean\n30 Polichinelos\n10 Ring Row\n\n\nForça - Split Jerk - TC. 15'\n\n\nPR` },
      { id: '2', title: 'Hang Power Clean', details: `For Time 8'\n\n\n50 Hang Power Clean\nEach break 12 Encolhimentos de Ombro KB` },
      { id: '3', title: "For Time 11'", details: `RX\n\n\n100 D.U.\n10 Pull Ups\n80 D.U.\n15 Pull Ups\n60 D.U.\n20 Pull Ups\n40 D.U.\n25 Pull Ups\n20 D.U.\n30 Pull Ups\n\n\nScaled\n\n\n200 S.U.\n20 Ring Row\n160 S.U.\n30 Ring Row\n120 S.U.\n20 Ring Row\n80 S.U.\n25 Ring Row\n20 S.U.\n30 Ring Row` },
    ],
  },
  {
    date: '2026-04-03', title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: `Mobility + Warm Up\n\n\n30" Mão Na Parede\n30" PVC Pass Lateral\n30" Deitado no Ombro\n30" Deitado no Ombro Invertido\n\n\n2 Rounds Of\n\n\n10 Ring Row\n10 Air Squats\n5 Burpees\n\n\nPotência BMU\n\n\n4 Rounds\n\n\n4 Entradas da Caixa\n4 Toques de Quadril na Barra` },
      { id: '2', title: 'BMU', details: `Dia 2 - Passo a Passo Avancado pra quem entrou da caixa solo\n\n\nOu\n\n\nRx/ Condicionamento\nEmom 12'\n\n\n1 - 3 BMU/ 3 Tentativas da Caixa\n2 - 12 Burpees To Target\n3 - Rest` },
      { id: '3', title: "Amrap 5'", details: `Categoria Única\n\n\nMax Air Squat Unbk\nEach Break 10 Burpees` },
    ],
  },
];

export const seedWorkoutData = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const db = admin.firestore();
  let wodsCreated = 0;
  let classesCreated = 0;

  for (const entry of WORKOUT_DATA) {
    const { date, title, sessions } = entry;
    const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay();
    const slots = COACH_SCHEDULE[dayOfWeek] ?? [];

    // Deletar classes existentes + reservas (cascade)
    const classSnap = await db.collection('classes').where('date', '==', date).get();
    if (!classSnap.empty) {
      const batch = db.batch();
      for (const classDoc of classSnap.docs) {
        const resSnap = await db.collection('reservations').where('classId', '==', classDoc.id).get();
        resSnap.docs.forEach((r) => batch.delete(r.ref));
        batch.delete(classDoc.ref);
      }
      await batch.commit();
    }

    // Criar WOD
    await db.doc(`wods/${date}`).set({
      date,
      sessions,
      createdBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    wodsCreated++;

    // Criar classes
    if (slots.length > 0) {
      const classBatch = db.batch();
      for (const slot of slots) {
        const ref = db.collection('classes').doc();
        classBatch.set(ref, {
          title,
          coach: slot.coach,
          date,
          time: slot.time,
          capacity: 20,
          createdBy: request.auth.uid,
        });
        classesCreated++;
      }
      await classBatch.commit();
    }
  }

  return { datesProcessed: WORKOUT_DATA.length, wodsCreated, classesCreated };
});

// ---------------------------------------------------------------------------
// fixClassCapacity — admin: atualiza capacity de todas as aulas para 15
// Executar UMA vez após ajuste do valor padrão
// ---------------------------------------------------------------------------

export const fixClassCapacity = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const db = admin.firestore();
  const snap = await db.collection('classes').get();
  if (snap.empty) return { updated: 0 };

  const CHUNK = 400;
  let updated = 0;

  for (let i = 0; i < snap.docs.length; i += CHUNK) {
    const batch = db.batch();
    snap.docs.slice(i, i + CHUNK).forEach((d) => {
      batch.update(d.ref, { capacity: 15 });
      updated++;
    });
    await batch.commit();
  }

  return { updated };
});

// ---------------------------------------------------------------------------
// Seed mensal genérico (aceita dados como parâmetro — sem redeploy por mês)
// ---------------------------------------------------------------------------

interface WodSession   { id: string; title: string; details: string; }
interface WodBatchEntry { date: string; title: string; sessions: WodSession[]; }

export const seedWodBatch = onCall({ timeoutSeconds: 300 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');
  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const { entries } = request.data as { entries: WodBatchEntry[] };
  if (!entries || !Array.isArray(entries)) {
    throw new HttpsError('invalid-argument', 'entries[] é obrigatório.');
  }

  const db = admin.firestore();
  const uid = request.auth.uid;

  const results = await Promise.all(
    entries
      .filter((e) => e.title !== 'FECHADO')
      .map(async (entry) => {
        const { date, title, sessions } = entry;
        const dayOfWeek = new Date(date + 'T12:00:00Z').getUTCDay();
        const slots = COACH_SCHEDULE[dayOfWeek] ?? [];

        // Cascade delete classes + reservas existentes para a data
        const existingClasses = await db.collection('classes').where('date', '==', date).get();
        if (!existingClasses.empty) {
          const batch = db.batch();
          for (const cls of existingClasses.docs) {
            const resSnap = await db.collection('reservations').where('classId', '==', cls.id).get();
            resSnap.docs.forEach((r) => batch.delete(r.ref));
            batch.delete(cls.ref);
          }
          await batch.commit();
        }

        // Criar wod/{date}
        await db.doc(`wods/${date}`).set({
          date,
          sessions,
          createdBy: uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Criar aulas por horário em paralelo
        await Promise.all(
          slots.map((slot) =>
            db.collection('classes').add({
              title,
              coach: slot.coach,
              date,
              time: slot.time,
              capacity: 15,
              createdBy: uid,
            })
          )
        );

        return slots.length;
      })
  );

  return {
    datesProcessed: results.length,
    wodsCreated: results.length,
    classesCreated: results.reduce((sum, n) => sum + n, 0),
  };
});

// ---------------------------------------------------------------------------
// Wellhub integration
// ---------------------------------------------------------------------------

/**
 * wellhubWebhook — HTTP endpoint (público) que recebe eventos de reserva/cancelamento do Wellhub.
 * Configurar URL no Partners Portal: https://us-central1-cftvk-edcff.cloudfunctions.net/wellhubWebhook
 */
export const wellhubWebhook = onRequest(
  { secrets: [wellhubAuthToken, wellhubSecretKey, wellhubGymId] },
  async (req, res) => {
    // Validar assinatura HMAC-SHA1
    const signature = req.headers['x-gympass-signature'] as string | undefined;
    const rawBody   = JSON.stringify(req.body);
    const expected  = crypto
      .createHmac('sha1', wellhubSecretKey.value())
      .update(rawBody)
      .digest('hex')
      .toUpperCase();

    if (!signature || signature !== expected) {
      res.status(403).send('Invalid signature');
      return;
    }

    const { event_type, event_data } = req.body as {
      event_type: string;
      event_data: {
        user: { unique_token: string; name: string; email?: string };
        slot: { id: number; gym_id: number; class_id: number; booking_number: string };
      };
    };

    const db      = admin.firestore();
    const gymId   = wellhubGymId.value();
    const token   = wellhubAuthToken.value();
    const baseUrl = wellhubBaseUrl.value?.() ?? 'https://api.partners.gympass.com';

    const patchBooking = (bookingNumber: string, status: string, reasonCategory?: string) =>
      fetch(`${baseUrl}/booking/v2/gyms/${gymId}/bookings/${bookingNumber}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reasonCategory ? { status, reason_category: reasonCategory } : { status }),
      });

    if (event_type === 'booking-requested') {
      const { slot, user } = event_data;

      // Localizar a aula pelo wellhubSlotId
      const classSnap = await db
        .collection('classes')
        .where('wellhubSlotId', '==', String(slot.id))
        .limit(1)
        .get();

      if (classSnap.empty) {
        await patchBooking(slot.booking_number, 'REJECTED', 'USAGE_RESTRICTION');
        res.status(200).send('ok');
        return;
      }

      const classDoc  = classSnap.docs[0];
      const classData = classDoc.data();

      // Verificar capacidade
      const resSnap = await db
        .collection('reservations')
        .where('classId', '==', classDoc.id)
        .get();

      if (resSnap.size >= classData.capacity) {
        await patchBooking(slot.booking_number, 'REJECTED', 'CLASS_IS_FULL');
        res.status(200).send('ok');
        return;
      }

      // Criar reserva
      await db.collection('reservations').add({
        userId:               `wellhub_${user.unique_token}`,
        classId:              classDoc.id,
        status:               'BOOKED',
        source:               'wellhub',
        wellhubBookingNumber: slot.booking_number,
        wellhubUserName:      user.name,
        wellhubUserId:        user.unique_token,
        classDate:            classData.date,
        classTime:            classData.time,
        createdAt:            admin.firestore.FieldValue.serverTimestamp(),
      });

      await patchBooking(slot.booking_number, 'RESERVED');
      res.status(200).send('ok');
      return;
    }

    if (event_type === 'booking-canceled' || event_type === 'booking-late-canceled') {
      const { slot } = event_data;
      const resSnap = await db
        .collection('reservations')
        .where('wellhubBookingNumber', '==', slot.booking_number)
        .limit(1)
        .get();

      if (!resSnap.empty) {
        await resSnap.docs[0].ref.delete();
      }
      res.status(200).send('ok');
      return;
    }

    res.status(200).send('ok');
  }
);

/**
 * wellhubCheckinWebhook — HTTP endpoint (público) que recebe eventos de check-in físico do Wellhub.
 * Configurar URL no Partners Portal: https://us-central1-cftvk-edcff.cloudfunctions.net/wellhubCheckinWebhook
 *
 * Responder 200 = pagamento confirmado ao box.
 * Se o toggle wellhubAutoCheckin estiver OFF em settings/box, responde 400 (bloqueia).
 */
export const wellhubCheckinWebhook = onRequest(
  { secrets: [wellhubSecretKey] },
  async (req, res) => {
    const signature = req.headers['x-gympass-signature'] as string | undefined;
    const rawBody   = JSON.stringify(req.body);
    const expected  = crypto
      .createHmac('sha1', wellhubSecretKey.value())
      .update(rawBody)
      .digest('hex')
      .toUpperCase();

    if (!signature || signature !== expected) {
      res.status(403).send('Invalid signature');
      return;
    }

    const db = admin.firestore();

    const settingsSnap = await db.doc('settings/box').get();
    const autoCheckin  = settingsSnap.exists
      ? settingsSnap.data()!.wellhubAutoCheckin !== false
      : true;

    if (!autoCheckin) {
      res.status(400).send('Auto check-in disabled');
      return;
    }

    const { event_data } = req.body as {
      event_data: {
        user: { unique_token_id: string };
        date: string;
        gym_id: number;
        pass_id: string;
        protocol_id: string;
        protocol_timestamp: string;
      };
    };

    const { unique_token_id, date } = event_data.user
      ? { unique_token_id: event_data.user.unique_token_id, date: event_data.date }
      : { unique_token_id: '', date: '' };

    if (!unique_token_id || !date) {
      res.status(200).send('ok');
      return;
    }

    const resSnap = await db
      .collection('reservations')
      .where('wellhubUserId', '==', unique_token_id)
      .where('classDate', '==', date)
      .limit(1)
      .get();

    if (!resSnap.empty) {
      await resSnap.docs[0].ref.update({ status: 'CHECKED_IN' });
    }

    res.status(200).send('ok');
  }
);

/**
 * syncClassToWellhub — Registra uma aula do CFTVK como "slot" no Wellhub.
 * Chamada pelo admin. Salva o wellhubSlotId de volta no documento da aula.
 * Parâmetros: { classId: string }
 * O wellhubClassId é lido do secret WELLHUB_CLASS_ID.
 */
export const syncClassToWellhub = onCall(
  { secrets: [wellhubAuthToken, wellhubGymId, wellhubClassId, wellhubBaseUrl] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');
    const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
    if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
    }

    const { classId } = request.data as { classId: string };
    if (!classId) throw new HttpsError('invalid-argument', 'classId é obrigatório.');

    const db        = admin.firestore();
    const classDoc  = await db.doc(`classes/${classId}`).get();
    if (!classDoc.exists) throw new HttpsError('not-found', 'Aula não encontrada.');

    const cls     = classDoc.data()!;
    const gymId   = wellhubGymId.value();
    const token   = wellhubAuthToken.value();
    const wClassId = wellhubClassId.value();
    const baseUrl  = wellhubBaseUrl.value?.() ?? 'https://api.partners.gympass.com';

    // occur_date: ISO 8601 com fuso Brasil (BRT = UTC-3)
    const occurDate = `${cls.date}T${cls.time}:00-03:00`;

    const response = await fetch(
      `${baseUrl}/booking/v1/gyms/${gymId}/classes/${wClassId}/slots`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occur_date:       occurDate,
          length_in_minutes: 60,
          total_capacity:   cls.capacity,
          total_booked:     0,
          status:           1,
          instructors:      [{ name: cls.coach }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new HttpsError('internal', `Wellhub API error: ${error}`);
    }

    const slotData = await response.json() as { id: number };
    await db.doc(`classes/${classId}`).update({ wellhubSlotId: String(slotData.id) });

    return { wellhubSlotId: slotData.id };
  }
);

// ---------------------------------------------------------------------------
// seedClasses — admin: popula classes/ de 2026-05-02 até 2026-12-31
// Execução única. Não toca a coleção wods/ (WODs já existem).
// ---------------------------------------------------------------------------

const SEED_SCHEDULE: Record<number, { time: string; coach: string }[]> = {
  1: [ // Segunda — Thayan
    { time: '06:00', coach: 'Thayan' }, { time: '08:00', coach: 'Thayan' },
    { time: '09:00', coach: 'Thayan' }, { time: '15:00', coach: 'Thayan' },
    { time: '18:00', coach: 'Thayan' }, { time: '19:00', coach: 'Thayan' },
    { time: '20:00', coach: 'Thayan' },
  ],
  2: [ // Terça — Julio Souza
    { time: '06:00', coach: 'Julio Souza' }, { time: '08:00', coach: 'Julio Souza' },
    { time: '09:00', coach: 'Julio Souza' }, { time: '15:00', coach: 'Julio Souza' },
    { time: '18:00', coach: 'Julio Souza' }, { time: '19:00', coach: 'Julio Souza' },
    { time: '20:00', coach: 'Julio Souza' },
  ],
  3: [ // Quarta — Everton (manhã) + Tatiana (tarde)
    { time: '06:00', coach: 'Everton' }, { time: '08:00', coach: 'Everton' },
    { time: '09:00', coach: 'Everton' }, { time: '15:00', coach: 'Tatiana' },
    { time: '18:00', coach: 'Tatiana' }, { time: '19:00', coach: 'Tatiana' },
    { time: '20:00', coach: 'Tatiana' },
  ],
  4: [ // Quinta — Julio Souza
    { time: '06:00', coach: 'Julio Souza' }, { time: '08:00', coach: 'Julio Souza' },
    { time: '09:00', coach: 'Julio Souza' }, { time: '15:00', coach: 'Julio Souza' },
    { time: '18:00', coach: 'Julio Souza' }, { time: '19:00', coach: 'Julio Souza' },
    { time: '20:00', coach: 'Julio Souza' },
  ],
  5: [ // Sexta — Everton (manhã) + Tatiana (15h) + Jansen Moura (tarde)
    { time: '06:00', coach: 'Everton' }, { time: '08:00', coach: 'Everton' },
    { time: '09:00', coach: 'Everton' }, { time: '15:00', coach: 'Tatiana' },
    { time: '18:00', coach: 'Jansen Moura' }, { time: '19:00', coach: 'Jansen Moura' },
    { time: '20:00', coach: 'Jansen Moura' },
  ],
  6: [ // Sábado — Julio Souza
    { time: '09:00', coach: 'Julio Souza' },
  ],
};

export const seedClasses = onCall({ timeoutSeconds: 300 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data()!.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem usar esta função.');
  }

  const db = admin.firestore();
  const uid = request.auth.uid;

  // Gera lista de todos os documentos a criar
  const toCreate: { date: string; time: string; coach: string }[] = [];
  const start = new Date(Date.UTC(2026, 4, 2));  // 2026-05-02
  const end   = new Date(Date.UTC(2026, 11, 31)); // 2026-12-31

  const curr = new Date(start);
  while (curr <= end) {
    const dow     = curr.getUTCDay();
    const y       = curr.getUTCFullYear();
    const m       = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const d       = String(curr.getUTCDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const slots = SEED_SCHEDULE[dow] ?? [];
    for (const slot of slots) {
      toCreate.push({ date: dateStr, time: slot.time, coach: slot.coach });
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  // Grava em batches de 400
  const CHUNK = 400;
  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const batch = db.batch();
    toCreate.slice(i, i + CHUNK).forEach((cls) => {
      batch.set(db.collection('classes').doc(), {
        title: 'Crossfit',
        coach: cls.coach,
        date: cls.date,
        time: cls.time,
        capacity: 15,
        createdBy: uid,
      });
    });
    await batch.commit();
  }

  return { created: toCreate.length };
});
