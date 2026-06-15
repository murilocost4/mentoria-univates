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

function findById(id) {
  return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

function findByEmail(email) {
  return mapUser(db.prepare('SELECT * FROM users WHERE email = ?').get(email));
}

function updateName(id, name) {
  db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name, id);
}

function updateRole(id, role) {
  db.prepare('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?').run(role, id);
}

module.exports = { findById, findByEmail, updateName, updateRole, parseJson };
