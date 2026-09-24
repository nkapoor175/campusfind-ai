const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');

// POST /api/claims - File a claim for a found item
router.post('/', claimController.createClaim);

// GET /api/claims/student/:studentId - List all claims filed by a student
router.get('/student/:studentId', claimController.getClaimsByStudent);

// GET /api/claims/found/:foundId - List all claims associated with a found item
router.get('/found/:foundId', claimController.getClaimsByFoundItem);

// PUT /api/claims/:id/status - Admin updates claim status and verification notes
router.put('/:id/status', claimController.updateClaimStatus);

module.exports = router;
