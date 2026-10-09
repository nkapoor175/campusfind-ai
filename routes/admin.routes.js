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

// PUT /api/admin/found/:id/return - Mark a claimed found item as returned to its owner
router.put('/found/:id/return', requireAdmin, adminController.returnFoundItem);

// DELETE /api/admin/lost/:id - Permanently remove a spam lost report (and its photos, matches, notifications)
router.delete('/lost/:id', requireAdmin, adminController.deleteLostItem);

// DELETE /api/admin/found/:id - Permanently remove a spam found report (and its photos, matches, notifications, claims)
router.delete('/found/:id', requireAdmin, adminController.deleteFoundItem);

module.exports = router;
