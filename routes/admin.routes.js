const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// GET /api/admin/pending - List all pending lost and found reports
router.get('/pending', adminController.getPendingReports);

// PUT /api/admin/lost/:id/verify - Verify a lost item report
router.put('/lost/:id/verify', adminController.verifyLostItem);

// PUT /api/admin/found/:id/verify - Verify a found item report
router.put('/found/:id/verify', adminController.verifyFoundItem);

module.exports = router;
