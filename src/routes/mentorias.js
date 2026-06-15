const express = require('express');
const MentorshipController = require('../controllers/MentorshipController');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

const alunoOuMentor = requireRole('ALUNO', 'MENTOR');

router.get('/mentorias/:id/agendar', requireRole('MENTOR'), MentorshipController.showAgendar);
router.post('/mentorias/:id/agendar', requireRole('MENTOR'), MentorshipController.saveAgendar);
router.post('/mentorias/:id/cancelar', alunoOuMentor, MentorshipController.cancelar);
router.post('/mentorias/:id/concluir', requireRole('MENTOR'), MentorshipController.concluir);
router.post('/mentorias/:id/avaliar', requireRole('ALUNO'), MentorshipController.avaliar);
router.get('/historico', alunoOuMentor, MentorshipController.historico);

module.exports = router;
