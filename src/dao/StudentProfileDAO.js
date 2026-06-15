const db = require('../config/database');
const { parseJson } = require('./UserDAO');

function mapProfile(row) {
  if (!row) return null;
  return {
    ...row,
    interests: parseJson(row.interests, []),
  };
}

function findByUserId(userId) {
  return mapProfile(db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(userId));
}

function upsert(userId, data) {
  const existing = findByUserId(userId);
  const interests = JSON.stringify(data.interests || []);

  if (existing) {
    db.prepare(`
      UPDATE student_profiles
      SET photo_url = ?, course = ?, interests = ?
      WHERE user_id = ?
    `).run(data.photo_url || null, data.course || null, interests, userId);
  } else {
    db.prepare(`
      INSERT INTO student_profiles (user_id, photo_url, course, interests)
      VALUES (?, ?, ?, ?)
    `).run(userId, data.photo_url || null, data.course || null, interests);
  }
}

module.exports = { findByUserId, upsert };
