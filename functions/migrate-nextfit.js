/**
 * migrate-nextfit.js
 * ------------------
 * Script de migração: NextFit JSON → Firestore (coleção `classes`)
 * Cria também os 5 usuários coach no Firebase Auth + Firestore.
 *
 * PRÉ-REQUISITO:
 *   Baixar chave de serviço em:
 *   Firebase Console → Configurações do Projeto → Contas de Serviço → Gerar nova chave privada
 *   Salvar como: functions/serviceAccountKey.json
 *
 * EXECUÇÃO:
 *   cd functions
 *   node migrate-nextfit.js
 */

'use strict';

const admin = require('firebase-admin');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const JSON_SOURCE_PATH = 'C:\\Users\\fabri\\OneDrive\\Área de Trabalho\\wods_formatados_firestore.json';

const CAPACITY = 15;
const WEEKDAY_SLOTS = ['06:00', '08:00', '09:00', '15:00', '18:00', '19:00', '20:00'];
const SATURDAY_SLOTS = ['09:00'];

// Coaches: nome, email, senha
const COACHES = [
  { name: 'Thayan',             email: 'thayan@cftvk.com',       password: 'Cftvk@2026!' },
  { name: 'Julio Souza',        email: 'juliosouza@cftvk.com',   password: 'Cftvk@2026!' },
  { name: 'Everton',            email: 'everton@cftvk.com',      password: 'Cftvk@2026!' },
  { name: 'Tatiana Fernandes',  email: 'tatiana@cftvk.com',      password: 'Cftvk@2026!' },
  { name: 'Janse Moura',        email: 'jansemoura@cftvk.com',   password: 'Cftvk@2026!' },
];

// Atribuição de coach por dia da semana (1=Seg … 5=Sex, 6=Sab) e horário
// dayOfWeek usa getDay() — 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
function getCoach(dayOfWeek, time) {
  const MORNING_SLOTS = new Set(['06:00', '08:00', '09:00']);

  switch (dayOfWeek) {
    case 1: return 'Thayan';            // Segunda
    case 2: return 'Julio Souza';       // Terça
    case 3: return MORNING_SLOTS.has(time) ? 'Everton' : 'Tatiana Fernandes'; // Quarta
    case 4: return 'Julio Souza';       // Quinta
    case 5: return MORNING_SLOTS.has(time) ? 'Everton' : 'Janse Moura';       // Sexta
    case 6: return 'Julio Souza';       // Sábado
    default: return 'Coach CFTVK';      // fallback (Domingo, não deveria ocorrer)
  }
}

// Normalização de títulos
function normalizeTitle(titulo) {
  const t = titulo.trim();
  if (/^gym/i.test(t)) return 'GYM';
  if (/^meti?con/i.test(t)) return 'Metcon';
  if (t === 'LPO') return 'LPO';
  if (t === 'Hero') return 'Hero';
  if (t === 'Interativo') return 'Interativo';
  if (/^4º/i.test(t)) return '4º Benchmark';
  if (t.toUpperCase() === 'FECHADO') return 'FECHADO';
  return t; // mantém original para casos não mapeados
}

// ---------------------------------------------------------------------------
// Helpers de batch (limite seguro: 400 ops por batch)
// ---------------------------------------------------------------------------

const BATCH_LIMIT = 400;

class BatchWriter {
  constructor(db) {
    this.db = db;
    this.batches = [];
    this.current = db.batch();
    this.count = 0;
    this.total = 0;
  }

  set(ref, data) {
    if (this.count >= BATCH_LIMIT) {
      this.batches.push(this.current);
      this.current = this.db.batch();
      this.count = 0;
    }
    this.current.set(ref, data);
    this.count++;
    this.total++;
  }

  async commit() {
    if (this.count > 0) this.batches.push(this.current);
    for (const batch of this.batches) {
      await batch.commit();
    }
    return this.total;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Verificar arquivos necessários
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Chave de serviço não encontrada em:', SERVICE_ACCOUNT_PATH);
    console.error('   Baixe em: Firebase Console → Configurações → Contas de Serviço → Gerar nova chave privada');
    process.exit(1);
  }

  if (!fs.existsSync(JSON_SOURCE_PATH)) {
    console.error('❌ Arquivo JSON não encontrado em:', JSON_SOURCE_PATH);
    process.exit(1);
  }

  // Inicializar Firebase Admin
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();
  const auth = admin.auth();

  console.log('✅ Firebase inicializado');
  console.log('');

  // ---------------------------------------------------------------------------
  // 1. Criar coaches
  // ---------------------------------------------------------------------------

  console.log('── Criando coaches ──────────────────────────────────');
  const coachNameToInfo = {}; // name → { uid, email, password }

  for (const coach of COACHES) {
    try {
      const userRecord = await auth.createUser({
        email: coach.email,
        password: coach.password,
        displayName: coach.name,
      });

      await auth.setCustomUserClaims(userRecord.uid, { role: 'coach' });

      await db.doc(`users/${userRecord.uid}`).set({
        name: coach.name,
        email: coach.email,
        role: 'coach',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      coachNameToInfo[coach.name] = { uid: userRecord.uid, email: coach.email, password: coach.password };
      console.log(`  ✅ ${coach.name} | ${coach.email} | ${coach.password}`);

    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log(`  ⚠️  ${coach.name} já existe (${coach.email}) — pulando criação`);
        coachNameToInfo[coach.name] = { email: coach.email, password: coach.password };
      } else {
        console.error(`  ❌ Erro ao criar ${coach.name}:`, err.message);
      }
    }
  }

  console.log('');

  // ---------------------------------------------------------------------------
  // 2. Processar JSON e criar classes
  // ---------------------------------------------------------------------------

  console.log('── Processando aulas ────────────────────────────────');

  const wodList = JSON.parse(fs.readFileSync(JSON_SOURCE_PATH, 'utf8'));
  const writer = new BatchWriter(db);
  let skipped = 0;
  let classCount = 0;

  for (const wod of wodList) {
    const title = normalizeTitle(wod.titulo);

    // Ignorar dias FECHADOS
    if (title === 'FECHADO') {
      console.log(`  ⏭️  Ignorando FECHADO: ${wod.data.split('T')[0]}`);
      skipped++;
      continue;
    }

    // Extrair data
    const dateStr = wod.data.split('T')[0]; // YYYY-MM-DD
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn(`  ⚠️  Data inválida em entrada id=${wod.id}: "${wod.data}" — pulando`);
      skipped++;
      continue;
    }

    // Dia da semana (usando UTC para evitar problemas de timezone na data)
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getDay(); // 0=Dom … 6=Sab

    // Ignorar Domingos (não deveriam existir no JSON, mas por segurança)
    if (dayOfWeek === 0) {
      console.log(`  ⏭️  Ignorando Domingo: ${dateStr}`);
      skipped++;
      continue;
    }

    // Slots de horário
    const slots = dayOfWeek === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;

    // Mapear atividades → sessions
    const sessions = (wod.atividades || [])
      .sort((a, b) => a.ordem - b.ordem)
      .map((atv) => ({
        id: randomUUID(),
        title: atv.titulo || '',
        details: atv.descricao || '',
      }));

    // Criar um documento por slot
    for (const time of slots) {
      const coach = getCoach(dayOfWeek, time);
      const docRef = db.collection('classes').doc();

      writer.set(docRef, {
        title,
        coach,
        date: dateStr,
        time,
        capacity: CAPACITY,
        createdBy: 'migration-script',
        sessions,
      });

      classCount++;
    }
  }

  // Commit
  process.stdout.write(`  Commitando ${writer.total} documentos...`);
  const committed = await writer.commit();
  console.log(` ${committed} ✅`);
  console.log('');

  // ---------------------------------------------------------------------------
  // 3. Resumo final
  // ---------------------------------------------------------------------------

  console.log('── Resumo ───────────────────────────────────────────');
  console.log(`  WODs processados : ${wodList.length - skipped}`);
  console.log(`  WODs ignorados   : ${skipped} (FECHADO / inválidos)`);
  console.log(`  Aulas criadas    : ${classCount}`);
  console.log('');
  console.log('── Credenciais dos coaches ──────────────────────────');
  for (const coach of COACHES) {
    console.log(`  ${coach.name.padEnd(22)} | ${coach.email.padEnd(26)} | ${coach.password}`);
  }
  console.log('');
  console.log('🎉 Migração concluída!');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
