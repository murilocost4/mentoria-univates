const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/perfil', requireRole('ALUNO'), ProfileController.showStudentProfile);
router.post('/perfil', requireRole('ALUNO'), ProfileController.saveStudentProfile);
router.post('/virar-mentor', requireRole('ALUNO'), ProfileController.becomeMentor);
router.get('/mentor/perfil', requireRole('MENTOR'), ProfileController.showMentorProfile);
router.post('/mentor/perfil', requireRole('MENTOR'), ProfileController.saveMentorProfile);

module.exports = router;
