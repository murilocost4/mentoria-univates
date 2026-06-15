const db = require('../config/database');

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function mapUser(row) {
  if (!row) return null;
  return { ...row };
}

async function findById(id) {
  return mapUser(await db.queryOne('SELECT * FROM users WHERE id = ?', [id]));
}

async function findByEmail(email) {
  return mapUser(await db.queryOne('SELECT * FROM users WHERE email = ?', [email]));
}

async function updateName(id, name) {
  await db.run("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?", [name, id]);
}

async function updateRole(id, role) {
  await db.run("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?", [role, id]);
}

module.exports = { findById, findByEmail, updateName, updateRole, parseJson };
