const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const { requireStudent, requireAdmin } = require('../middleware/auth');

// POST /api/claims - File a claim for a found item (the student comes from the token)
router.post('/', requireStudent, claimController.createClaim);

// GET /api/claims - Admin lists all claims (with claimant and item names)
router.get('/', requireAdmin, claimController.getAllClaims);

// GET /api/claims/student/:studentId - List all claims filed by a student
router.get('/student/:studentId', claimController.getClaimsByStudent);

// GET /api/claims/found/:foundId - List all claims associated with a found item
router.get('/found/:foundId', claimController.getClaimsByFoundItem);

// PUT /api/claims/:id/status - Admin updates claim status and verification notes (the admin comes from the token)
router.put('/:id/status', requireAdmin, claimController.updateClaimStatus);

module.exports = router;
