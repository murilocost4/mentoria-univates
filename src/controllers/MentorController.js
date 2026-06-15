const MentorProfileDAO = require('../dao/MentorProfileDAO');
const ReviewDAO = require('../dao/ReviewDAO');
const MentorshipRequestDAO = require('../dao/MentorshipRequestDAO');
const { setFlash } = require('../middleware/auth');
const emailService = require('../services/email');

function list(req, res) {
  const filters = {
    disciplina: req.query.disciplina || '',
    curso: req.query.curso || '',
    disponibilidade: req.query.disponibilidade || '',
  };
  const mentores = MentorProfileDAO.searchApproved(filters);
  res.render('mentores/index', { mentores, filters });
}

function show(req, res) {
  const mentorId = Number(req.params.id);
  const mentor = MentorProfileDAO.findApprovedById(mentorId);

  if (!mentor) {
    setFlash(req, 'erro', 'Mentor não encontrado.');
    return res.redirect('/mentores');
  }

  const reviews = ReviewDAO.findByMentor(mentorId);
  const minhasSolicitacoes = MentorshipRequestDAO.findByStudent(req.session.userId)
    .filter((s) => s.mentor_id === mentorId);

  res.render('mentores/show', { mentor, reviews, minhasSolicitacoes });
}

async function solicitar(req, res) {
  const mentorId = Number(req.params.id);
  const mentor = MentorProfileDAO.findApprovedById(mentorId);

  if (!mentor) {
    setFlash(req, 'erro', 'Mentor não encontrado ou não aprovado.');
    return res.redirect('/mentores');
  }

  const { discipline, message } = req.body;

  if (!discipline) {
    setFlash(req, 'erro', 'Selecione uma disciplina.');
    return res.redirect(`/mentores/${mentorId}`);
  }

  MentorshipRequestDAO.create({
    studentId: req.session.userId,
    mentorId,
    discipline,
    message: message?.trim() || null,
  });

  await emailService.notifyNewRequest(
    mentor.email,
    req.session.name,
    discipline
  );

  setFlash(req, 'sucesso', 'Solicitação enviada com sucesso.');
  res.redirect(`/mentores/${mentorId}`);
}

module.exports = { list, show, solicitar };
