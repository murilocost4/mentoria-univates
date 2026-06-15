const db = require('../config/database');

async function create(requestId) {
  const result = await db.run(`
    INSERT INTO mentorships (request_id, status) VALUES (?, 'ACEITA')
  `, [requestId]);
  return result.lastInsertRowid;
}

async function findById(id) {
  return db.queryOne(`
    SELECT ms.*, mr.student_id, mr.mentor_id, mr.discipline, mr.message,
           s.name as student_name, s.email as student_email,
           m.name as mentor_name, m.email as mentor_email
    FROM mentorships ms
    JOIN mentorship_requests mr ON mr.id = ms.request_id
    JOIN users s ON s.id = mr.student_id
    JOIN users m ON m.id = mr.mentor_id
    WHERE ms.id = ?
  `, [id]);
}

async function findByRequestId(requestId) {
  const row = await db.queryOne('SELECT id FROM mentorships WHERE request_id = ?', [requestId]);
  if (!row) return null;
  return findById(row.id);
}

async function schedule(id, { scheduledAt, type, meetingLink, location }) {
  await db.run(`
    UPDATE mentorships
    SET scheduled_at = ?, status = 'AGENDADA', type = ?,
        meeting_link = ?, location = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [scheduledAt, type, meetingLink || null, location || null, id]);
}

async function cancel(id, { cancelledBy, cancelReason }) {
  await db.run(`
    UPDATE mentorships
    SET status = 'CANCELADA', cancelled_by = ?, cancel_reason = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `, [cancelledBy, cancelReason || null, id]);
}

async function complete(id) {
  await db.run(`
    UPDATE mentorships
    SET status = 'CONCLUIDA', completed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `, [id]);
}

async function findByUser(userId, role, statusFilter) {
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
  return db.queryAll(sql, params);
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
