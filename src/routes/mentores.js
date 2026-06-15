const express = require('express');
const MentorController = require('../controllers/MentorController');
const { requireRole } = require('../middleware/roles');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/mentores', requireRole('ALUNO'), asyncHandler(MentorController.list));
router.get('/mentores/:id', requireRole('ALUNO'), asyncHandler(MentorController.show));
router.post('/mentores/:id/solicitar', requireRole('ALUNO'), asyncHandler(MentorController.solicitar));

module.exports = router;
