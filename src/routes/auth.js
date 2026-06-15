const express = require('express');
const AuthController = require('../controllers/AuthController');
const { requireGuest } = require('../middleware/auth');

const router = express.Router();

router.get('/login', requireGuest, AuthController.showLogin);
router.post('/login', requireGuest, AuthController.doLogin);
router.get('/logout', AuthController.logout);

module.exports = router;
