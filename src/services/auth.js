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

function needsTermsAcceptance(user) {
  return !user || !user.terms_accepted_at;
}

async function loginUser(email, name, { acceptTerms = false } = {}) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    return { error: 'Apenas contas @universo.univates.br são permitidas.' };
  }

  let user = await db.queryOne('SELECT * FROM users WHERE email = ?', [normalized]);
  const isNewUser = !user;

  if (isNewUser) {
    if (!acceptTerms) {
      return {
        error: 'Você precisa aceitar os Termos de Uso, a Política de Privacidade e as Regras de Conduta.',
        requireTerms: true,
      };
    }

    const displayName = (name || '').trim() || normalized.split('@')[0];
    const result = await db.run(
      "INSERT INTO users (email, name, role, terms_accepted_at) VALUES (?, ?, ?, datetime('now'))",
      [normalized, displayName, 'ALUNO']
    );

    const userId = result.lastInsertRowid;
    await db.run('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
    user = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  } else {
    if (!user.terms_accepted_at && !acceptTerms) {
      return {
        error: 'Você precisa aceitar os Termos de Uso, a Política de Privacidade e as Regras de Conduta.',
        requireTerms: true,
      };
    }

    if (!user.terms_accepted_at && acceptTerms) {
      await db.run(
        "UPDATE users SET terms_accepted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
        [user.id]
      );
      user = await db.queryOne('SELECT * FROM users WHERE id = ?', [user.id]);
    }

    if (name && name.trim() && !user.name) {
      await db.run("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?", [name.trim(), user.id]);
      user = await db.queryOne('SELECT * FROM users WHERE id = ?', [user.id]);
    }
  }

  return { user, isNewUser };
}

module.exports = {
  isValidEmail,
  normalizeEmail,
  loginUser,
  needsTermsAcceptance,
  ALLOWED_DOMAIN,
};
