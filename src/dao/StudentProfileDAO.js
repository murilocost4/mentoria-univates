const db = require('../config/database');
const { parseJson } = require('./UserDAO');

function mapProfile(row) {
  if (!row) return null;
  return {
    ...row,
    interests: parseJson(row.interests, []),
  };
}

async function findByUserId(userId) {
  return mapProfile(await db.queryOne('SELECT * FROM student_profiles WHERE user_id = ?', [userId]));
}

async function upsert(userId, data) {
  const existing = await findByUserId(userId);
  const interests = JSON.stringify(data.interests || []);

  if (existing) {
    await db.run(`
      UPDATE student_profiles
      SET photo_url = ?, course = ?, interests = ?
      WHERE user_id = ?
    `, [data.photo_url || null, data.course || null, interests, userId]);
  } else {
    await db.run(`
      INSERT INTO student_profiles (user_id, photo_url, course, interests)
      VALUES (?, ?, ?, ?)
    `, [userId, data.photo_url || null, data.course || null, interests]);
  }
}

module.exports = { findByUserId, upsert };
