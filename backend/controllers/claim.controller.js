const claimService = require('../services/claim.service');

/**
 * POST /api/claims
 * File a claim for a found item
 */
async function createClaim(req, res) {
  try {
    const { studentId, foundId } = req.body;

    if (
      studentId === undefined || studentId === null || isNaN(Number(studentId)) || Number(studentId) <= 0 ||
      foundId === undefined || foundId === null || isNaN(Number(foundId)) || Number(foundId) <= 0
    ) {
      return res.status(400).json({ message: 'Invalid or missing studentId or foundId' });
    }

    const newClaim = await claimService.createClaim(Number(studentId), Number(foundId));
    return res.status(201).json({
      message: 'Claim submitted successfully',
      claim: newClaim,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in createClaim:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/claims/student/:studentId
 * List all claims filed by a student
 */
async function getClaimsByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const claims = await claimService.getClaimsByStudent(studentId);
    return res.status(200).json(claims);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in getClaimsByStudent:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/claims/found/:foundId
 * List all claims associated with a found item
 */
async function getClaimsByFoundItem(req, res) {
  try {
    const foundId = parseInt(req.params.foundId, 10);

    if (isNaN(foundId) || foundId <= 0) {
      return res.status(400).json({ message: 'Invalid found item ID' });
    }

    const claims = await claimService.getClaimsByFoundItem(foundId);
    return res.status(200).json(claims);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in getClaimsByFoundItem:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/claims/:id/status
 * Admin updates claim status (Approved / Rejected) and verification notes
 */
async function updateClaimStatus(req, res) {
  try {
    const claimId = parseInt(req.params.id, 10);
    const { adminId, claimStatus, verificationNotes } = req.body;

    if (isNaN(claimId) || claimId <= 0) {
      return res.status(400).json({ message: 'Invalid claim ID' });
    }

    if (adminId === undefined || adminId === null || isNaN(Number(adminId)) || Number(adminId) <= 0) {
      return res.status(400).json({ message: 'Invalid or missing adminId' });
    }

    const allowedStatuses = ['Approved', 'Rejected'];
    if (!claimStatus || !allowedStatuses.includes(claimStatus)) {
      return res.status(400).json({ message: 'Invalid claimStatus. Must be Approved or Rejected' });
    }

    const updatedClaim = await claimService.updateClaimStatus(
      claimId,
      Number(adminId),
      claimStatus,
      verificationNotes
    );

    return res.status(200).json({
      message: `Claim status updated to ${claimStatus}`,
      claim: updatedClaim,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in updateClaimStatus:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createClaim,
  getClaimsByStudent,
  getClaimsByFoundItem,
  updateClaimStatus,
};
