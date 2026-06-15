const express = require('express');
const MentorshipRequestController = require('../controllers/MentorshipRequestController');
const { requireRole } = require('../middleware/roles');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/mentor/solicitacoes', requireRole('MENTOR'), asyncHandler(MentorshipRequestController.listSolicitacoes));
router.post('/mentor/solicitacoes/:id/aceitar', requireRole('MENTOR'), asyncHandler(MentorshipRequestController.aceitar));
router.post('/mentor/solicitacoes/:id/recusar', requireRole('MENTOR'), asyncHandler(MentorshipRequestController.recusar));

module.exports = router;
