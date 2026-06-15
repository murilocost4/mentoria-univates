const express = require('express');
const MentorshipRequestController = require('../controllers/MentorshipRequestController');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/mentor/solicitacoes', requireRole('MENTOR'), MentorshipRequestController.listSolicitacoes);
router.post('/mentor/solicitacoes/:id/aceitar', requireRole('MENTOR'), MentorshipRequestController.aceitar);
router.post('/mentor/solicitacoes/:id/recusar', requireRole('MENTOR'), MentorshipRequestController.recusar);

module.exports = router;
