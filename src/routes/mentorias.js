const express = require('express');
const MentorshipController = require('../controllers/MentorshipController');
const { requireRole } = require('../middleware/roles');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

const alunoOuMentor = requireRole('ALUNO', 'MENTOR');

router.get('/mentorias/:id/agendar', requireRole('MENTOR'), asyncHandler(MentorshipController.showAgendar));
router.post('/mentorias/:id/agendar', requireRole('MENTOR'), asyncHandler(MentorshipController.saveAgendar));
router.post('/mentorias/:id/cancelar', alunoOuMentor, asyncHandler(MentorshipController.cancelar));
router.post('/mentorias/:id/concluir', requireRole('MENTOR'), asyncHandler(MentorshipController.concluir));
router.post('/mentorias/:id/avaliar', requireRole('ALUNO'), asyncHandler(MentorshipController.avaliar));
router.get('/historico', alunoOuMentor, asyncHandler(MentorshipController.historico));

module.exports = router;
