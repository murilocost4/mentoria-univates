const StudentProfileDAO = require('../dao/StudentProfileDAO');
const UserDAO = require('../dao/UserDAO');
const MentorProfileDAO = require('../dao/MentorProfileDAO');
const { setFlash } = require('../middleware/auth');

function parseTags(value) {
  return (value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseAvailability(body) {
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const availability = {};
  for (const day of days) {
    const slots = (body[`avail_${day}`] || '').trim();
    if (slots) {
      availability[day] = slots.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return availability;
}

function showStudentProfile(req, res) {
  const profile = StudentProfileDAO.findByUserId(req.session.userId);
  const user = UserDAO.findById(req.session.userId);
  res.render('perfil/aluno', { profile, user });
}

function saveStudentProfile(req, res) {
  const { name, photo_url, course, interests } = req.body;

  if (!name || !name.trim()) {
    setFlash(req, 'erro', 'Nome é obrigatório.');
    return res.redirect('/perfil');
  }

  UserDAO.updateName(req.session.userId, name.trim());
  req.session.name = name.trim();

  StudentProfileDAO.upsert(req.session.userId, {
    photo_url: photo_url?.trim() || null,
    course: course?.trim() || null,
    interests: parseTags(interests),
  });

  setFlash(req, 'sucesso', 'Perfil atualizado com sucesso.');
  res.redirect('/perfil');
}

function becomeMentor(req, res) {
  const existing = MentorProfileDAO.findByUserId(req.session.userId);
  if (!existing) {
    MentorProfileDAO.create(req.session.userId);
  }
  UserDAO.updateRole(req.session.userId, 'MENTOR');
  req.session.role = 'MENTOR';
  setFlash(req, 'sucesso', 'Cadastro de mentor iniciado. Complete seu perfil e aguarde aprovação.');
  res.redirect('/mentor/perfil');
}

function showMentorProfile(req, res) {
  const profile = MentorProfileDAO.findByUserId(req.session.userId);
  const user = UserDAO.findById(req.session.userId);
  res.render('perfil/mentor', { profile, user });
}

function saveMentorProfile(req, res) {
  const { course, disciplines } = req.body;
  const availability = parseAvailability(req.body);

  MentorProfileDAO.upsert(req.session.userId, {
    course: course?.trim() || null,
    disciplines: parseTags(disciplines),
    availability,
  });

  setFlash(req, 'sucesso', 'Perfil de mentor atualizado.');
  res.redirect('/mentor/perfil');
}

module.exports = {
  showStudentProfile,
  saveStudentProfile,
  becomeMentor,
  showMentorProfile,
  saveMentorProfile,
  parseTags,
  parseAvailability,
};
