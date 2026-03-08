/**
 * cleanup-migrated-classes.js
 * ---------------------------
 * Apaga todas as aulas criadas pelo script de migração (createdBy === 'migration-script').
 * Mantém intactos: coaches, alunos, reservas e demais documentos.
 *
 * EXECUÇÃO:
 *   cd functions
 *   node cleanup-migrated-classes.js
 */

'use strict';

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const BATCH_LIMIT = 400;

async function main() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Chave de serviço não encontrada em:', SERVICE_ACCOUNT_PATH);
    process.exit(1);
  }

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  console.log('✅ Firebase inicializado');
  console.log('🔍 Buscando aulas migradas (createdBy == "migration-script")...');

  const snap = await db.collection('classes')
    .where('createdBy', '==', 'migration-script')
    .get();

  if (snap.empty) {
    console.log('ℹ️  Nenhuma aula migrada encontrada. Nada a apagar.');
    process.exit(0);
  }

  console.log(`🗑️  ${snap.size} aulas encontradas. Apagando...`);

  // Deletar em batches
  const docs = snap.docs;
  let deleted = 0;

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + BATCH_LIMIT);
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += chunk.length;
    process.stdout.write(`  ${deleted}/${docs.length} apagados...\r`);
  }

  console.log(`\n✅ ${deleted} aulas apagadas com sucesso.`);
  console.log('👤 Coaches e demais dados foram preservados.');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
