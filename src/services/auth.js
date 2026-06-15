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

function loginUser(db, email, name) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    return { error: 'Apenas contas @universo.univates.br são permitidas.' };
  }

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized);

  if (!user) {
    const displayName = (name || '').trim() || normalized.split('@')[0];
    const result = db.prepare(
      'INSERT INTO users (email, name, role) VALUES (?, ?, ?)'
    ).run(normalized, displayName, 'ALUNO');

    const userId = result.lastInsertRowid;
    db.prepare('INSERT INTO student_profiles (user_id) VALUES (?)').run(userId);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  } else if (name && name.trim() && !user.name) {
    db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(name.trim(), user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  return { user };
}

module.exports = { isValidEmail, normalizeEmail, loginUser, ALLOWED_DOMAIN };
