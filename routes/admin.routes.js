const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth');

// POST /api/admin/login - Admin logs in (the only public admin route)
router.post('/login', adminController.login);

// GET /api/admin/pending - List all pending lost and found reports
router.get('/pending', requireAdmin, adminController.getPendingReports);

// PUT /api/admin/lost/:id/verify - Verify a lost item report
router.put('/lost/:id/verify', requireAdmin, adminController.verifyLostItem);

// PUT /api/admin/found/:id/verify - Verify a found item report
router.put('/found/:id/verify', requireAdmin, adminController.verifyFoundItem);

module.exports = router;
