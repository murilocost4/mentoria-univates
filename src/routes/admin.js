const express = require('express');
const AdminController = require('../controllers/AdminController');
const { requireRole } = require('../middleware/roles');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/admin/mentores', requireRole('ADMIN'), asyncHandler(AdminController.list));
router.post('/admin/mentores/:id/aprovar', requireRole('ADMIN'), asyncHandler(AdminController.aprovar));
router.post('/admin/mentores/:id/reprovar', requireRole('ADMIN'), asyncHandler(AdminController.reprovar));

module.exports = router;
