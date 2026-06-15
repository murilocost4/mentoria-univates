const MentorshipRequestDAO = require('../dao/MentorshipRequestDAO');
const MentorshipDAO = require('../dao/MentorshipDAO');
const { setFlash } = require('../middleware/auth');
const emailService = require('../services/email');

function listSolicitacoes(req, res) {
  const solicitacoes = MentorshipRequestDAO.findByMentor(req.session.userId);
  res.render('mentor/solicitacoes', { solicitacoes });
}

async function aceitar(req, res) {
  const id = Number(req.params.id);
  const solicitacao = MentorshipRequestDAO.findById(id);

  if (!solicitacao || solicitacao.mentor_id !== req.session.userId) {
    setFlash(req, 'erro', 'Solicitação não encontrada.');
    return res.redirect('/mentor/solicitacoes');
  }

  if (solicitacao.status !== 'PENDENTE') {
    setFlash(req, 'erro', 'Esta solicitação já foi processada.');
    return res.redirect('/mentor/solicitacoes');
  }

  MentorshipRequestDAO.updateStatus(id, 'ACEITA');
  const mentorshipId = MentorshipDAO.create(id);

  await emailService.notifyRequestDecision(
    solicitacao.student_email,
    true,
    solicitacao.mentor_name
  );

  setFlash(req, 'sucesso', 'Solicitação aceita. Agende a mentoria.');
  res.redirect(`/mentorias/${mentorshipId}/agendar`);
}

async function recusar(req, res) {
  const id = Number(req.params.id);
  const solicitacao = MentorshipRequestDAO.findById(id);

  if (!solicitacao || solicitacao.mentor_id !== req.session.userId) {
    setFlash(req, 'erro', 'Solicitação não encontrada.');
    return res.redirect('/mentor/solicitacoes');
  }

  if (solicitacao.status !== 'PENDENTE') {
    setFlash(req, 'erro', 'Esta solicitação já foi processada.');
    return res.redirect('/mentor/solicitacoes');
  }

  MentorshipRequestDAO.updateStatus(id, 'RECUSADA');

  await emailService.notifyRequestDecision(
    solicitacao.student_email,
    false,
    solicitacao.mentor_name
  );

  setFlash(req, 'sucesso', 'Solicitação recusada.');
  res.redirect('/mentor/solicitacoes');
}

module.exports = { listSolicitacoes, aceitar, recusar };
