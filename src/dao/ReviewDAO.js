const db = require('../config/database');

async function create({ mentorshipId, studentId, mentorId, rating, comment }) {
  await db.run(`
    INSERT INTO reviews (mentorship_id, student_id, mentor_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `, [mentorshipId, studentId, mentorId, rating, comment || null]);
}

async function findByMentorship(mentorshipId) {
  return db.queryOne('SELECT * FROM reviews WHERE mentorship_id = ?', [mentorshipId]);
}

async function findByMentor(mentorId) {
  return db.queryAll(`
    SELECT r.*, s.name as student_name
    FROM reviews r
    JOIN users s ON s.id = r.student_id
    WHERE r.mentor_id = ?
    ORDER BY r.created_at DESC
  `, [mentorId]);
}

module.exports = { create, findByMentorship, findByMentor };
