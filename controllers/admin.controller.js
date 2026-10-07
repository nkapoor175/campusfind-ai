const adminService = require('../services/admin.service');

/**
 * POST /api/admin/login
 * Admin logs in with email and password and receives an admin JWT
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const result = await adminService.loginAdmin(email.trim(), password);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in admin login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

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
 * Verify a lost item report (the admin is taken from the token, never from the body)
 */
async function verifyLostItem(req, res) {
  try {
    const lostId = parseInt(req.params.id, 10);

    if (isNaN(lostId) || lostId <= 0) {
      return res.status(400).json({ message: 'Invalid lost item ID' });
    }

    const updatedItem = await adminService.verifyLostItem(lostId, req.user.adminId);
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
 * Verify a found item report (the admin is taken from the token, never from the body)
 */
async function verifyFoundItem(req, res) {
  try {
    const foundId = parseInt(req.params.id, 10);

    if (isNaN(foundId) || foundId <= 0) {
      return res.status(400).json({ message: 'Invalid found item ID' });
    }

    const updatedItem = await adminService.verifyFoundItem(foundId, req.user.adminId);
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
  login,
  getPendingReports,
  verifyLostItem,
  verifyFoundItem,
};
