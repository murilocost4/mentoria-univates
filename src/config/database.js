const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

let client = null;
let initialized = false;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../../database/app.db')}`;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }
  return client;
}

function rowToObject(row) {
  if (!row) return null;
  return { ...row };
}

async function queryOne(sql, args = []) {
  const result = await getClient().execute({ sql, args });
  return rowToObject(result.rows[0]);
}

async function queryAll(sql, args = []) {
  const result = await getClient().execute({ sql, args });
  return result.rows.map(rowToObject);
}

async function run(sql, args = []) {
  const result = await getClient().execute({ sql, args });
  return {
    lastInsertRowid: Number(result.lastInsertRowid ?? 0),
    changes: Number(result.rowsAffected ?? 0),
  };
}

function splitSql(content) {
  return content
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));
}

async function execSqlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const statements = splitSql(content);
  const db = getClient();

  for (const sql of statements) {
    await db.execute(sql);
  }
}

async function runMigrations() {
  const columns = await queryAll('PRAGMA table_info(users)');
  const hasTerms = columns.some((c) => c.name === 'terms_accepted_at');

  if (!hasTerms) {
    await run('ALTER TABLE users ADD COLUMN terms_accepted_at TEXT');
    console.log('Migração: coluna terms_accepted_at adicionada.');
  }
}

async function initDatabase() {
  if (initialized) return;

  const table = await queryOne(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'"
  );

  if (!table) {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    await execSqlFile(schemaPath);
    await execSqlFile(seedPath);
    console.log('Banco inicializado (schema + seed).');
  } else {
    await runMigrations();
  }

  initialized = true;
}

module.exports = {
  getClient,
  initDatabase,
  queryOne,
  queryAll,
  run,
};
