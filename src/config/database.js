const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/app.db');
const isNew = !fs.existsSync(dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

if (isNew) {
  const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');
  db.exec(schema);
  db.exec(seed);
}

module.exports = db;
