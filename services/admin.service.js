const pool = require('../config/db');

/**
 * Fetch all lost and found items where AdminID is NULL (pending verification)
 */
async function getPendingItems() {
  const [lostItems] = await pool.execute(
    'SELECT * FROM LOST_ITEM WHERE AdminID IS NULL ORDER BY DateLost DESC, LostID DESC'
  );

  const [foundItems] = await pool.execute(
    'SELECT * FROM FOUND_ITEM WHERE AdminID IS NULL ORDER BY DateFound DESC, FoundID DESC'
  );

  return {
    lostItems,
    foundItems,
  };
}

/**
 * Verify a lost item report by setting its AdminID
 * @param {number} lostId 
 * @param {number} adminId 
 */
async function verifyLostItem(lostId, adminId) {
  // Check if admin exists
  const [adminRows] = await pool.execute(
    'SELECT AdminID FROM ADMIN WHERE AdminID = ?',
    [adminId]
  );
  if (adminRows.length === 0) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if lost item exists and its current verification status
  const [itemRows] = await pool.execute(
    'SELECT LostID, AdminID FROM LOST_ITEM WHERE LostID = ?',
    [lostId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Lost item not found');
    error.statusCode = 404;
    throw error;
  }

  const lostItem = itemRows[0];
  if (lostItem.AdminID !== null) {
    const error = new Error('Lost item is already verified');
    error.statusCode = 409;
    throw error;
  }

  // Update AdminID on LOST_ITEM
  await pool.execute(
    'UPDATE LOST_ITEM SET AdminID = ? WHERE LostID = ? AND AdminID IS NULL',
    [adminId, lostId]
  );

  // Return updated item details
  const [updatedRows] = await pool.execute(
    'SELECT * FROM LOST_ITEM WHERE LostID = ?',
    [lostId]
  );

  return updatedRows[0];
}

/**
 * Verify a found item report by setting its AdminID
 * @param {number} foundId 
 * @param {number} adminId 
 */
async function verifyFoundItem(foundId, adminId) {
  // Check if admin exists
  const [adminRows] = await pool.execute(
    'SELECT AdminID FROM ADMIN WHERE AdminID = ?',
    [adminId]
  );
  if (adminRows.length === 0) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if found item exists and its current verification status
  const [itemRows] = await pool.execute(
    'SELECT FoundID, AdminID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }

  const foundItem = itemRows[0];
  if (foundItem.AdminID !== null) {
    const error = new Error('Found item is already verified');
    error.statusCode = 409;
    throw error;
  }

  // Update AdminID on FOUND_ITEM
  await pool.execute(
    'UPDATE FOUND_ITEM SET AdminID = ? WHERE FoundID = ? AND AdminID IS NULL',
    [adminId, foundId]
  );

  // Return updated item details
  const [updatedRows] = await pool.execute(
    'SELECT * FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );

  return updatedRows[0];
}

module.exports = {
  getPendingItems,
  verifyLostItem,
  verifyFoundItem,
};
