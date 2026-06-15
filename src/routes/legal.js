const express = require('express');
const LegalController = require('../controllers/LegalController');

const router = express.Router();

router.get('/termos', LegalController.termos);
router.get('/privacidade', LegalController.privacidade);
router.get('/conduta', LegalController.conduta);

module.exports = router;
