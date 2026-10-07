const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

/**
 * Log an admin in with email and password and issue an admin JWT
 * @param {string} email
 * @param {string} password
 */
async function loginAdmin(email, password) {
  const [rows] = await pool.execute(
    'SELECT AdminID, Name, Email, Password FROM ADMIN WHERE Email = ?',
    [email]
  );

  // Unknown email, an admin with no password set yet, and a wrong password all look the same
  const invalid = new Error('Invalid email or password');
  invalid.statusCode = 401;

  if (rows.length === 0 || !rows[0].Password) {
    throw invalid;
  }

  const matches = await bcrypt.compare(password, rows[0].Password);
  if (!matches) {
    throw invalid;
  }

  const admin = rows[0];
  const token = jwt.sign(
    { adminId: admin.AdminID, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    token,
    admin: { AdminID: admin.AdminID, Name: admin.Name, Email: admin.Email },
  };
}

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

/**
 * Mark a claimed found item as handed back to its owner (Claimed -> Returned).
 * The lost report it was confirmed against, if any, is closed too.
 * @param {number} foundId
 */
async function returnFoundItem(foundId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT Status FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE',
      [foundId]
    );
    if (rows.length === 0) {
      const error = new Error('Found item not found');
      error.statusCode = 404;
      throw error;
    }
    if (rows[0].Status !== 'Claimed') {
      const error = new Error(`Only a Claimed found item can be marked Returned (current status: ${rows[0].Status})`);
      error.statusCode = 409;
      throw error;
    }

    await connection.execute("UPDATE FOUND_ITEM SET Status = 'Returned' WHERE FoundID = ?", [foundId]);
    await connection.execute(
      `UPDATE LOST_ITEM SET Status = 'Closed'
       WHERE LostID IN (
         SELECT LostID FROM MATCH_RECORD WHERE FoundID = ? AND MatchStatus = 'Confirmed'
       )`,
      [foundId]
    );

    const [updatedRows] = await connection.execute('SELECT * FROM FOUND_ITEM WHERE FoundID = ?', [foundId]);
    await connection.commit();
    return updatedRows[0];
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Delete the photo files behind removed image rows. Best effort: only files inside
 * uploads/ are touched, and a file that is already gone is not an error.
 * @param {string[]} imageUrls
 * @returns {Promise<number>} how many files were deleted
 */
async function removeImageFiles(imageUrls) {
  let removed = 0;
  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith('/uploads/')) continue;

    const filePath = path.resolve(__dirname, '..', '.' + imageUrl);
    if (!filePath.startsWith(UPLOADS_DIR + path.sep)) continue;

    try {
      await fs.unlink(filePath);
      removed += 1;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Failed to delete image file:', filePath, err);
      }
    }
  }
  return removed;
}

/**
 * Permanently remove a lost report (spam) and everything that hangs off it:
 * its photos, its match records and those matches' notifications.
 * This is the one deliberate hard delete; everything else uses the Status lifecycle.
 * @param {number} lostId
 */
async function deleteLostItem(lostId) {
  const connection = await pool.getConnection();
  let imageUrls = [];
  let matchCount = 0;
  let notificationCount = 0;

  try {
    await connection.beginTransaction();

    const [items] = await connection.execute(
      'SELECT LostID FROM LOST_ITEM WHERE LostID = ? FOR UPDATE',
      [lostId]
    );
    if (items.length === 0) {
      const error = new Error('Lost item not found');
      error.statusCode = 404;
      throw error;
    }

    const [matches] = await connection.execute('SELECT MatchID FROM MATCH_RECORD WHERE LostID = ?', [lostId]);
    const matchIds = matches.map((m) => m.MatchID);
    matchCount = matchIds.length;

    if (matchCount > 0) {
      const [deletedNotifications] = await connection.query('DELETE FROM NOTIFICATION WHERE MatchID IN (?)', [matchIds]);
      notificationCount = deletedNotifications.affectedRows;
      await connection.execute('DELETE FROM MATCH_RECORD WHERE LostID = ?', [lostId]);
    }

    const [images] = await connection.execute('SELECT ImageURL FROM LOST_ITEM_IMAGE WHERE LostID = ?', [lostId]);
    imageUrls = images.map((i) => i.ImageURL);
    await connection.execute('DELETE FROM LOST_ITEM_IMAGE WHERE LostID = ?', [lostId]);

    await connection.execute('DELETE FROM LOST_ITEM WHERE LostID = ?', [lostId]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  const filesRemoved = await removeImageFiles(imageUrls);
  return { images: imageUrls.length, imageFiles: filesRemoved, matches: matchCount, notifications: notificationCount };
}

/**
 * Permanently remove a found report (spam) and everything that hangs off it:
 * its photos, its match records and those matches' notifications, and the claims on it.
 * A lost report that was Matched only through a removed Confirmed match goes back to Open.
 * @param {number} foundId
 */
async function deleteFoundItem(foundId) {
  const connection = await pool.getConnection();
  let imageUrls = [];
  let matchCount = 0;
  let notificationCount = 0;
  let claimCount = 0;
  let reopenedCount = 0;

  try {
    await connection.beginTransaction();

    const [items] = await connection.execute(
      'SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE',
      [foundId]
    );
    if (items.length === 0) {
      const error = new Error('Found item not found');
      error.statusCode = 404;
      throw error;
    }

    const [matches] = await connection.execute(
      'SELECT MatchID, LostID, MatchStatus FROM MATCH_RECORD WHERE FoundID = ?',
      [foundId]
    );
    const matchIds = matches.map((m) => m.MatchID);
    const confirmedLostIds = matches.filter((m) => m.MatchStatus === 'Confirmed').map((m) => m.LostID);
    matchCount = matchIds.length;

    if (matchCount > 0) {
      const [deletedNotifications] = await connection.query('DELETE FROM NOTIFICATION WHERE MatchID IN (?)', [matchIds]);
      notificationCount = deletedNotifications.affectedRows;
      await connection.execute('DELETE FROM MATCH_RECORD WHERE FoundID = ?', [foundId]);
    }

    const [deletedClaims] = await connection.execute('DELETE FROM CLAIM WHERE FoundID = ?', [foundId]);
    claimCount = deletedClaims.affectedRows;

    const [images] = await connection.execute('SELECT ImageURL FROM FOUND_ITEM_IMAGE WHERE FoundID = ?', [foundId]);
    imageUrls = images.map((i) => i.ImageURL);
    await connection.execute('DELETE FROM FOUND_ITEM_IMAGE WHERE FoundID = ?', [foundId]);

    await connection.execute('DELETE FROM FOUND_ITEM WHERE FoundID = ?', [foundId]);

    // A lost report that was Matched only because of a match we just removed is open again
    if (confirmedLostIds.length > 0) {
      const [reopened] = await connection.query(
        `UPDATE LOST_ITEM SET Status = 'Open'
         WHERE LostID IN (?) AND Status = 'Matched'
           AND NOT EXISTS (
             SELECT 1 FROM MATCH_RECORD m
             WHERE m.LostID = LOST_ITEM.LostID AND m.MatchStatus = 'Confirmed'
           )`,
        [confirmedLostIds]
      );
      reopenedCount = reopened.affectedRows;
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  const filesRemoved = await removeImageFiles(imageUrls);
  return {
    images: imageUrls.length,
    imageFiles: filesRemoved,
    matches: matchCount,
    notifications: notificationCount,
    claims: claimCount,
    reopenedLostItems: reopenedCount,
  };
}

module.exports = {
  loginAdmin,
  getPendingItems,
  verifyLostItem,
  verifyFoundItem,
  returnFoundItem,
  deleteLostItem,
  deleteFoundItem,
};
