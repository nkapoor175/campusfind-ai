const adminService = require('../services/admin.service');

/**
 * GET /api/admin/pending
 * Retrieve lost and found reports pending verification (AdminID IS NULL)
 */
async function getPendingReports(req, res) {
  try {
    const result = await adminService.getPendingItems();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPendingReports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/lost/:id/verify
 * Verify a lost item report
 */
async function verifyLostItem(req, res) {
  try {
    const lostId = parseInt(req.params.id, 10);
    const { adminId } = req.body;

    if (isNaN(lostId) || lostId <= 0) {
      return res.status(400).json({ message: 'Invalid lost item ID' });
    }

    if (adminId === undefined || adminId === null || isNaN(Number(adminId)) || Number(adminId) <= 0) {
      return res.status(400).json({ message: 'Invalid or missing adminId' });
    }

    const updatedItem = await adminService.verifyLostItem(lostId, Number(adminId));
    return res.status(200).json({
      message: 'Lost item verified successfully',
      item: updatedItem,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in verifyLostItem:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/found/:id/verify
 * Verify a found item report
 */
async function verifyFoundItem(req, res) {
  try {
    const foundId = parseInt(req.params.id, 10);
    const { adminId } = req.body;

    if (isNaN(foundId) || foundId <= 0) {
      return res.status(400).json({ message: 'Invalid found item ID' });
    }

    if (adminId === undefined || adminId === null || isNaN(Number(adminId)) || Number(adminId) <= 0) {
      return res.status(400).json({ message: 'Invalid or missing adminId' });
    }

    const updatedItem = await adminService.verifyFoundItem(foundId, Number(adminId));
    return res.status(200).json({
      message: 'Found item verified successfully',
      item: updatedItem,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in verifyFoundItem:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getPendingReports,
  verifyLostItem,
  verifyFoundItem,
};
