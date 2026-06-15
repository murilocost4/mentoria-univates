const MentorshipDAO = require('../dao/MentorshipDAO');
const ReviewDAO = require('../dao/ReviewDAO');
const MentorProfileDAO = require('../dao/MentorProfileDAO');
const UserDAO = require('../dao/UserDAO');
const { setFlash } = require('../middleware/auth');
const emailService = require('../services/email');

function canAccess(mentorship, userId, role) {
  if (role === 'ADMIN') return true;
  if (role === 'MENTOR') return mentorship.mentor_id === userId;
  return mentorship.student_id === userId;
}

async function showAgendar(req, res) {
  const id = Number(req.params.id);
  const mentorship = await MentorshipDAO.findById(id);

  if (!mentorship || !canAccess(mentorship, req.session.userId, req.session.role)) {
    setFlash(req, 'erro', 'Mentoria não encontrada.');
    return res.redirect('/historico');
  }

  if (req.session.role !== 'MENTOR') {
    setFlash(req, 'erro', 'Apenas o mentor pode agendar.');
    return res.redirect('/historico');
  }

  if (!['ACEITA', 'AGENDADA'].includes(mentorship.status)) {
    setFlash(req, 'erro', 'Esta mentoria não pode ser agendada.');
    return res.redirect('/historico');
  }

  res.render('mentorias/agendar', { mentorship, erro: null });
}

async function saveAgendar(req, res) {
  const id = Number(req.params.id);
  const mentorship = await MentorshipDAO.findById(id);

  if (!mentorship || mentorship.mentor_id !== req.session.userId) {
    setFlash(req, 'erro', 'Mentoria não encontrada.');
    return res.redirect('/historico');
  }

  const { scheduled_at, type, meeting_link, location } = req.body;
  const scheduledAt = scheduled_at ? scheduled_at.replace('T', ' ') + ':00' : null;
  let erro = null;

  if (!scheduled_at) erro = 'Data e hora são obrigatórias.';
  else if (!type || !['ONLINE', 'PRESENCIAL'].includes(type)) erro = 'Tipo inválido.';
  else if (type === 'ONLINE' && (!meeting_link || !/^https?:\/\/.+/.test(meeting_link))) {
    erro = 'Link da reunião é obrigatório e deve ser uma URL válida (http/https).';
  } else if (type === 'PRESENCIAL' && (!location || !location.trim())) {
    erro = 'Local é obrigatório para mentorias presenciais.';
  }

  if (erro) {
    return res.render('mentorias/agendar', { mentorship, erro });
  }

  await MentorshipDAO.schedule(id, {
    scheduledAt,
    type,
    meetingLink: meeting_link?.trim() || null,
    location: location?.trim() || null,
  });

  const updated = await MentorshipDAO.findById(id);
  await emailService.notifyScheduled(
    updated.student_email,
    updated.mentor_email,
    updated
  );

  setFlash(req, 'sucesso', 'Mentoria agendada com sucesso.');
  res.redirect('/historico');
}

async function cancelar(req, res) {
  const id = Number(req.params.id);
  const mentorship = await MentorshipDAO.findById(id);

  if (!mentorship || !canAccess(mentorship, req.session.userId, req.session.role)) {
    setFlash(req, 'erro', 'Mentoria não encontrada.');
    return res.redirect('/historico');
  }

  if (!['ACEITA', 'AGENDADA'].includes(mentorship.status)) {
    setFlash(req, 'erro', 'Esta mentoria não pode ser cancelada.');
    return res.redirect('/historico');
  }

  const { cancel_reason } = req.body;
  await MentorshipDAO.cancel(id, {
    cancelledBy: req.session.userId,
    cancelReason: cancel_reason?.trim() || null,
  });

  const updated = await MentorshipDAO.findById(id);
  const cancelledByUser = await UserDAO.findById(req.session.userId);
  await emailService.notifyCancelled(
    updated.student_email,
    updated.mentor_email,
    updated,
    cancelledByUser.name
  );

  setFlash(req, 'sucesso', 'Mentoria cancelada.');
  res.redirect('/historico');
}

async function concluir(req, res) {
  const id = Number(req.params.id);
  const mentorship = await MentorshipDAO.findById(id);

  if (!mentorship || mentorship.mentor_id !== req.session.userId) {
    setFlash(req, 'erro', 'Mentoria não encontrada.');
    return res.redirect('/historico');
  }

  if (mentorship.status !== 'AGENDADA') {
    setFlash(req, 'erro', 'Apenas mentorias agendadas podem ser concluídas.');
    return res.redirect('/historico');
  }

  await MentorshipDAO.complete(id);

  await emailService.notifyReviewRequest(mentorship.student_email, id);

  setFlash(req, 'sucesso', 'Mentoria concluída. O aluno foi notificado para avaliar.');
  res.redirect('/historico');
}

async function historico(req, res) {
  const statusFilter = req.query.status || '';
  const mentorias = await MentorshipDAO.findByUser(
    req.session.userId,
    req.session.role,
    statusFilter || null
  );

  const now = new Date().toISOString();
  const futuras = mentorias.filter(
    (m) => m.status === 'AGENDADA' && m.scheduled_at && m.scheduled_at >= now
  );
  const passadas = mentorias.filter((m) => !futuras.includes(m));

  const reviewsMap = {};
  for (const m of mentorias) {
    if (m.status === 'CONCLUIDA') {
      reviewsMap[m.id] = await ReviewDAO.findByMentorship(m.id);
    }
  }

  res.render('mentorias/historico', {
    futuras,
    passadas,
    statusFilter,
    reviewsMap,
  });
}

async function avaliar(req, res) {
  const id = Number(req.params.id);
  const mentorship = await MentorshipDAO.findById(id);

  if (!mentorship || mentorship.student_id !== req.session.userId) {
    setFlash(req, 'erro', 'Mentoria não encontrada.');
    return res.redirect('/historico');
  }

  if (mentorship.status !== 'CONCLUIDA') {
    setFlash(req, 'erro', 'Só é possível avaliar mentorias concluídas.');
    return res.redirect('/historico');
  }

  const existing = await ReviewDAO.findByMentorship(id);
  if (existing) {
    setFlash(req, 'erro', 'Você já avaliou esta mentoria.');
    return res.redirect('/historico');
  }

  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) {
    setFlash(req, 'erro', 'Nota deve ser entre 1 e 5.');
    return res.redirect('/historico');
  }

  await ReviewDAO.create({
    mentorshipId: id,
    studentId: req.session.userId,
    mentorId: mentorship.mentor_id,
    rating,
    comment: req.body.comment?.trim() || null,
  });

  await MentorProfileDAO.updateRating(mentorship.mentor_id);

  setFlash(req, 'sucesso', 'Avaliação registrada. Obrigado!');
  res.redirect('/historico');
}

module.exports = {
  showAgendar,
  saveAgendar,
  cancelar,
  concluir,
  historico,
  avaliar,
};
