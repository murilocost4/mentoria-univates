const express = require('express');
const MentorController = require('../controllers/MentorController');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/mentores', requireRole('ALUNO'), MentorController.list);
router.get('/mentores/:id', requireRole('ALUNO'), MentorController.show);
router.post('/mentores/:id/solicitar', requireRole('ALUNO'), MentorController.solicitar);

module.exports = router;
