const express = require('express');
const AdminController = require('../controllers/AdminController');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/admin/mentores', requireRole('ADMIN'), AdminController.list);
router.post('/admin/mentores/:id/aprovar', requireRole('ADMIN'), AdminController.aprovar);
router.post('/admin/mentores/:id/reprovar', requireRole('ADMIN'), AdminController.reprovar);

module.exports = router;
