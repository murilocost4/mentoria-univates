const MentorProfileDAO = require('../dao/MentorProfileDAO');
const UserDAO = require('../dao/UserDAO');
const { setFlash } = require('../middleware/auth');
const emailService = require('../services/email');

function list(req, res) {
  const mentores = MentorProfileDAO.findPending();
  res.render('admin/mentores', { mentores });
}

async function aprovar(req, res) {
  const userId = Number(req.params.id);
  const mentor = MentorProfileDAO.findByUserId(userId);

  if (!mentor || mentor.status !== 'PENDENTE_APROVACAO') {
    setFlash(req, 'erro', 'Mentor não encontrado ou já processado.');
    return res.redirect('/admin/mentores');
  }

  MentorProfileDAO.approve(userId, req.session.userId);
  const user = UserDAO.findById(userId);
  await emailService.notifyMentorApproval(user.email, true);

  setFlash(req, 'sucesso', 'Mentor aprovado com sucesso.');
  res.redirect('/admin/mentores');
}

async function reprovar(req, res) {
  const userId = Number(req.params.id);
  const mentor = MentorProfileDAO.findByUserId(userId);

  if (!mentor || mentor.status !== 'PENDENTE_APROVACAO') {
    setFlash(req, 'erro', 'Mentor não encontrado ou já processado.');
    return res.redirect('/admin/mentores');
  }

  MentorProfileDAO.reject(userId, req.session.userId);
  const user = UserDAO.findById(userId);
  await emailService.notifyMentorApproval(user.email, false);

  setFlash(req, 'sucesso', 'Mentor reprovado.');
  res.redirect('/admin/mentores');
}

module.exports = { list, aprovar, reprovar };
