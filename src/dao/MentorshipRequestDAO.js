const db = require('../config/database');

function create({ studentId, mentorId, discipline, message }) {
  const result = db.prepare(`
    INSERT INTO mentorship_requests (student_id, mentor_id, discipline, message)
    VALUES (?, ?, ?, ?)
  `).run(studentId, mentorId, discipline, message || null);
  return result.lastInsertRowid;
}

function findById(id) {
  return db.prepare(`
    SELECT mr.*, s.name as student_name, s.email as student_email,
           m.name as mentor_name, m.email as mentor_email
    FROM mentorship_requests mr
    JOIN users s ON s.id = mr.student_id
    JOIN users m ON m.id = mr.mentor_id
    WHERE mr.id = ?
  `).get(id);
}

function findByMentor(mentorId) {
  return db.prepare(`
    SELECT mr.*, s.name as student_name, s.email as student_email
    FROM mentorship_requests mr
    JOIN users s ON s.id = mr.student_id
    WHERE mr.mentor_id = ?
    ORDER BY mr.created_at DESC
  `).all(mentorId);
}

function findByStudent(studentId) {
  return db.prepare(`
    SELECT mr.*, m.name as mentor_name, m.email as mentor_email
    FROM mentorship_requests mr
    JOIN users m ON m.id = mr.mentor_id
    WHERE mr.student_id = ?
    ORDER BY mr.created_at DESC
  `).all(studentId);
}

function updateStatus(id, status) {
  db.prepare(`
    UPDATE mentorship_requests SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, id);
}

module.exports = { create, findById, findByMentor, findByStudent, updateStatus };
