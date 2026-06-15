const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { requireRole } = require('../middleware/roles');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/perfil', requireRole('ALUNO'), asyncHandler(ProfileController.showStudentProfile));
router.post('/perfil', requireRole('ALUNO'), asyncHandler(ProfileController.saveStudentProfile));
router.post('/virar-mentor', requireRole('ALUNO'), asyncHandler(ProfileController.becomeMentor));
router.get('/mentor/perfil', requireRole('MENTOR'), asyncHandler(ProfileController.showMentorProfile));
router.post('/mentor/perfil', requireRole('MENTOR'), asyncHandler(ProfileController.saveMentorProfile));

module.exports = router;
