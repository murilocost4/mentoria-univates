const db = require('../config/database');
const { parseJson } = require('./UserDAO');

function mapProfile(row) {
  if (!row) return null;
  return {
    ...row,
    disciplines: parseJson(row.disciplines, []),
    availability: parseJson(row.availability, {}),
  };
}

function findByUserId(userId) {
  return mapProfile(db.prepare('SELECT * FROM mentor_profiles WHERE user_id = ?').get(userId));
}

function create(userId) {
  db.prepare(`
    INSERT INTO mentor_profiles (user_id, status) VALUES (?, 'PENDENTE_APROVACAO')
  `).run(userId);
}

function upsert(userId, data) {
  const existing = findByUserId(userId);
  const disciplines = JSON.stringify(data.disciplines || []);
  const availability = JSON.stringify(data.availability || {});

  if (existing) {
    db.prepare(`
      UPDATE mentor_profiles
      SET course = ?, disciplines = ?, availability = ?
      WHERE user_id = ?
    `).run(data.course || null, disciplines, availability, userId);
  } else {
    db.prepare(`
      INSERT INTO mentor_profiles (user_id, course, disciplines, availability, status)
      VALUES (?, ?, ?, ?, 'PENDENTE_APROVACAO')
    `).run(userId, data.course || null, disciplines, availability);
  }
}

function searchApproved(filters = {}) {
  let sql = `
    SELECT mp.*, u.name, u.email
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.status = 'APROVADO'
  `;
  const params = [];

  if (filters.curso) {
    sql += ' AND mp.course LIKE ?';
    params.push(`%${filters.curso}%`);
  }
  if (filters.disciplina) {
    sql += ' AND mp.disciplines LIKE ?';
    params.push(`%${filters.disciplina}%`);
  }
  if (filters.disponibilidade) {
    sql += ' AND mp.availability LIKE ?';
    params.push(`%${filters.disponibilidade}%`);
  }

  sql += ' ORDER BY u.name ASC';
  return db.prepare(sql).all(...params).map(mapProfile);
}

function findApprovedById(userId) {
  const row = db.prepare(`
    SELECT mp.*, u.name, u.email
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.user_id = ? AND mp.status = 'APROVADO'
  `).get(userId);
  return mapProfile(row);
}

function findPending() {
  return db.prepare(`
    SELECT mp.*, u.name, u.email
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.status = 'PENDENTE_APROVACAO'
    ORDER BY u.name ASC
  `).all().map(mapProfile);
}

function approve(userId, adminId) {
  db.prepare(`
    UPDATE mentor_profiles
    SET status = 'APROVADO', approved_by = ?, approved_at = datetime('now')
    WHERE user_id = ?
  `).run(adminId, userId);
}

function reject(userId, adminId) {
  db.prepare(`
    UPDATE mentor_profiles
    SET status = 'REPROVADO', approved_by = ?, approved_at = datetime('now')
    WHERE user_id = ?
  `).run(adminId, userId);
}

function updateRating(userId) {
  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM reviews WHERE mentor_id = ?
  `).get(userId);

  db.prepare(`
    UPDATE mentor_profiles
    SET average_rating = ?, review_count = ?
    WHERE user_id = ?
  `).run(stats.avg_rating || 0, stats.count || 0, userId);
}

module.exports = {
  findByUserId,
  create,
  upsert,
  searchApproved,
  findApprovedById,
  findPending,
  approve,
  reject,
  updateRating,
};
