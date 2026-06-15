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

async function findByUserId(userId) {
  return mapProfile(await db.queryOne('SELECT * FROM mentor_profiles WHERE user_id = ?', [userId]));
}

async function create(userId) {
  await db.run(`
    INSERT INTO mentor_profiles (user_id, status) VALUES (?, 'PENDENTE_APROVACAO')
  `, [userId]);
}

async function upsert(userId, data) {
  const existing = await findByUserId(userId);
  const disciplines = JSON.stringify(data.disciplines || []);
  const availability = JSON.stringify(data.availability || {});

  if (existing) {
    await db.run(`
      UPDATE mentor_profiles
      SET course = ?, disciplines = ?, availability = ?
      WHERE user_id = ?
    `, [data.course || null, disciplines, availability, userId]);
  } else {
    await db.run(`
      INSERT INTO mentor_profiles (user_id, course, disciplines, availability, status)
      VALUES (?, ?, ?, ?, 'PENDENTE_APROVACAO')
    `, [userId, data.course || null, disciplines, availability]);
  }
}

async function searchApproved(filters = {}) {
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
  const rows = await db.queryAll(sql, params);
  return rows.map(mapProfile);
}

async function findApprovedById(userId) {
  const row = await db.queryOne(`
    SELECT mp.*, u.name, u.email
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.user_id = ? AND mp.status = 'APROVADO'
  `, [userId]);
  return mapProfile(row);
}

async function findPending() {
  const rows = await db.queryAll(`
    SELECT mp.*, u.name, u.email
    FROM mentor_profiles mp
    JOIN users u ON u.id = mp.user_id
    WHERE mp.status = 'PENDENTE_APROVACAO'
    ORDER BY u.name ASC
  `);
  return rows.map(mapProfile);
}

async function approve(userId, adminId) {
  await db.run(`
    UPDATE mentor_profiles
    SET status = 'APROVADO', approved_by = ?, approved_at = datetime('now')
    WHERE user_id = ?
  `, [adminId, userId]);
}

async function reject(userId, adminId) {
  await db.run(`
    UPDATE mentor_profiles
    SET status = 'REPROVADO', approved_by = ?, approved_at = datetime('now')
    WHERE user_id = ?
  `, [adminId, userId]);
}

async function updateRating(userId) {
  const stats = await db.queryOne(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count
    FROM reviews WHERE mentor_id = ?
  `, [userId]);

  await db.run(`
    UPDATE mentor_profiles
    SET average_rating = ?, review_count = ?
    WHERE user_id = ?
  `, [stats?.avg_rating || 0, stats?.count || 0, userId]);
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
