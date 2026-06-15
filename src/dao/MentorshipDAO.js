const db = require('../config/database');

function create(requestId) {
  const result = db.prepare(`
    INSERT INTO mentorships (request_id, status) VALUES (?, 'ACEITA')
  `).run(requestId);
  return result.lastInsertRowid;
}

function findById(id) {
  return db.prepare(`
    SELECT ms.*, mr.student_id, mr.mentor_id, mr.discipline, mr.message,
           s.name as student_name, s.email as student_email,
           m.name as mentor_name, m.email as mentor_email
    FROM mentorships ms
    JOIN mentorship_requests mr ON mr.id = ms.request_id
    JOIN users s ON s.id = mr.student_id
    JOIN users m ON m.id = mr.mentor_id
    WHERE ms.id = ?
  `).get(id);
}

function findByRequestId(requestId) {
  return findById(
    db.prepare('SELECT id FROM mentorships WHERE request_id = ?').get(requestId)?.id
  );
}

function schedule(id, { scheduledAt, type, meetingLink, location }) {
  db.prepare(`
    UPDATE mentorships
    SET scheduled_at = ?, status = 'AGENDADA', type = ?,
        meeting_link = ?, location = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(scheduledAt, type, meetingLink || null, location || null, id);
}

function cancel(id, { cancelledBy, cancelReason }) {
  db.prepare(`
    UPDATE mentorships
    SET status = 'CANCELADA', cancelled_by = ?, cancel_reason = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(cancelledBy, cancelReason || null, id);
}

function complete(id) {
  db.prepare(`
    UPDATE mentorships
    SET status = 'CONCLUIDA', completed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(id);
}

function findByUser(userId, role, statusFilter) {
  let sql = `
    SELECT ms.*, mr.student_id, mr.mentor_id, mr.discipline, mr.message,
           s.name as student_name, m.name as mentor_name
    FROM mentorships ms
    JOIN mentorship_requests mr ON mr.id = ms.request_id
    JOIN users s ON s.id = mr.student_id
    JOIN users m ON m.id = mr.mentor_id
    WHERE ${role === 'MENTOR' ? 'mr.mentor_id' : 'mr.student_id'} = ?
  `;
  const params = [userId];

  if (statusFilter) {
    sql += ' AND ms.status = ?';
    params.push(statusFilter);
  }

  sql += ' ORDER BY ms.scheduled_at DESC, ms.created_at DESC';
  return db.prepare(sql).all(...params);
}

module.exports = {
  create,
  findById,
  findByRequestId,
  schedule,
  cancel,
  complete,
  findByUser,
};
