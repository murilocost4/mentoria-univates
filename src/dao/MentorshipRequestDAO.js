const db = require('../config/database');

async function create({ studentId, mentorId, discipline, message }) {
  const result = await db.run(`
    INSERT INTO mentorship_requests (student_id, mentor_id, discipline, message)
    VALUES (?, ?, ?, ?)
  `, [studentId, mentorId, discipline, message || null]);
  return result.lastInsertRowid;
}

async function findById(id) {
  return db.queryOne(`
    SELECT mr.*, s.name as student_name, s.email as student_email,
           m.name as mentor_name, m.email as mentor_email
    FROM mentorship_requests mr
    JOIN users s ON s.id = mr.student_id
    JOIN users m ON m.id = mr.mentor_id
    WHERE mr.id = ?
  `, [id]);
}

async function findByMentor(mentorId) {
  return db.queryAll(`
    SELECT mr.*, s.name as student_name, s.email as student_email
    FROM mentorship_requests mr
    JOIN users s ON s.id = mr.student_id
    WHERE mr.mentor_id = ?
    ORDER BY mr.created_at DESC
  `, [mentorId]);
}

async function findByStudent(studentId) {
  return db.queryAll(`
    SELECT mr.*, m.name as mentor_name, m.email as mentor_email
    FROM mentorship_requests mr
    JOIN users m ON m.id = mr.mentor_id
    WHERE mr.student_id = ?
    ORDER BY mr.created_at DESC
  `, [studentId]);
}

async function updateStatus(id, status) {
  await db.run(`
    UPDATE mentorship_requests SET status = ?, updated_at = datetime('now') WHERE id = ?
  `, [status, id]);
}

module.exports = { create, findById, findByMentor, findByStudent, updateStatus };
