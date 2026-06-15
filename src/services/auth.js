const db = require('../config/database');

const ALLOWED_DOMAIN = '@universo.univates.br';

function isValidEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return false;
  }
  return normalized.endsWith(ALLOWED_DOMAIN);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function loginUser(email, name) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    return { error: 'Apenas contas @universo.univates.br são permitidas.' };
  }

  let user = await db.queryOne('SELECT * FROM users WHERE email = ?', [normalized]);

  if (!user) {
    const displayName = (name || '').trim() || normalized.split('@')[0];
    const result = await db.run(
      'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
      [normalized, displayName, 'ALUNO']
    );

    const userId = result.lastInsertRowid;
    await db.run('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
    user = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  } else if (name && name.trim() && !user.name) {
    await db.run("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?", [name.trim(), user.id]);
    user = await db.queryOne('SELECT * FROM users WHERE id = ?', [user.id]);
  }

  return { user };
}

module.exports = { isValidEmail, normalizeEmail, loginUser, ALLOWED_DOMAIN };
