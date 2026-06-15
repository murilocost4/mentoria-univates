const db = require('../config/database');

function create({ mentorshipId, studentId, mentorId, rating, comment }) {
  db.prepare(`
    INSERT INTO reviews (mentorship_id, student_id, mentor_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(mentorshipId, studentId, mentorId, rating, comment || null);
}

function findByMentorship(mentorshipId) {
  return db.prepare('SELECT * FROM reviews WHERE mentorship_id = ?').get(mentorshipId);
}

function findByMentor(mentorId) {
  return db.prepare(`
    SELECT r.*, s.name as student_name
    FROM reviews r
    JOIN users s ON s.id = r.student_id
    WHERE r.mentor_id = ?
    ORDER BY r.created_at DESC
  `).all(mentorId);
}

module.exports = { create, findByMentorship, findByMentor };
