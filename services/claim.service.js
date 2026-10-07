const pool = require('../config/db');
const { createNotification } = require('./notification.service');

/**
 * File a claim for a found item
 * @param {number} studentId 
 * @param {number} foundId 
 */
async function createClaim(studentId, foundId) {
  // Check if student exists
  const [studentRows] = await pool.execute(
    'SELECT StudentID FROM STUDENT WHERE StudentID = ?',
    [studentId]
  );
  if (studentRows.length === 0) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if found item exists
  const [itemRows] = await pool.execute(
    'SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }

  // Check for duplicate pending claim by same student on same item
  const [existingClaims] = await pool.execute(
    "SELECT ClaimID FROM CLAIM WHERE StudentID = ? AND FoundID = ? AND ClaimStatus = 'Pending'",
    [studentId, foundId]
  );
  if (existingClaims.length > 0) {
    const error = new Error('A pending claim already exists for this student and found item');
    error.statusCode = 409;
    throw error;
  }

  // Create claim
  const [result] = await pool.execute(
    `INSERT INTO CLAIM (ClaimDate, ClaimStatus, VerificationNotes, StudentID, FoundID, AdminID)
     VALUES (NOW(), 'Pending', NULL, ?, ?, NULL)`,
    [studentId, foundId]
  );

  const [newClaimRows] = await pool.execute(
    'SELECT * FROM CLAIM WHERE ClaimID = ?',
    [result.insertId]
  );

  return newClaimRows[0];
}

/**
 * List all claims filed by a student
 * @param {number} studentId 
 */
async function getClaimsByStudent(studentId) {
  // Check if student exists
  const [studentRows] = await pool.execute(
    'SELECT StudentID FROM STUDENT WHERE StudentID = ?',
    [studentId]
  );
  if (studentRows.length === 0) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const [claims] = await pool.execute(
    'SELECT * FROM CLAIM WHERE StudentID = ? ORDER BY ClaimDate DESC, ClaimID DESC',
    [studentId]
  );

  return claims;
}

/**
 * List all claims associated with a found item
 * @param {number} foundId 
 */
async function getClaimsByFoundItem(foundId) {
  // Check if found item exists
  const [itemRows] = await pool.execute(
    'SELECT FoundID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (itemRows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }

  const [claims] = await pool.execute(
    'SELECT * FROM CLAIM WHERE FoundID = ? ORDER BY ClaimDate DESC, ClaimID DESC',
    [foundId]
  );

  return claims;
}

/**
 * Admin updates claim status, verification notes, and adminId
 * @param {number} claimId 
 * @param {number} adminId 
 * @param {string} claimStatus 
 * @param {string|null} verificationNotes 
 */
async function updateClaimStatus(claimId, adminId, claimStatus, verificationNotes) {
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

  // Check if claim exists
  const [claimRows] = await pool.execute(
    'SELECT ClaimID, ClaimStatus, StudentID, FoundID FROM CLAIM WHERE ClaimID = ?',
    [claimId]
  );
  if (claimRows.length === 0) {
    const error = new Error('Claim not found');
    error.statusCode = 404;
    throw error;
  }
  const claim = claimRows[0];

  const notes = (verificationNotes !== undefined && verificationNotes !== null)
    ? String(verificationNotes).trim()
    : null;

  // Claim update and item status changes must succeed or fail together
  const connection = await pool.getConnection();
  let updatedClaim;
  let itemName = null;
  try {
    await connection.beginTransaction();

    // Lock the found item row so two approvals can't both succeed
    const [foundRows] = await connection.execute(
      'SELECT ItemName, Status FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE',
      [claim.FoundID]
    );
    itemName = foundRows[0].ItemName;

    if (claimStatus === 'Approved' && ['Claimed', 'Returned'].includes(foundRows[0].Status)) {
      const error = new Error('Found item has already been claimed or returned');
      error.statusCode = 409;
      throw error;
    }

    // Update claim
    await connection.execute(
      `UPDATE CLAIM
       SET ClaimStatus = ?, VerificationNotes = ?, AdminID = ?
       WHERE ClaimID = ?`,
      [claimStatus, notes, adminId, claimId]
    );

    // Approval hands the item over: found item becomes Claimed, and the lost
    // report it was confirmed against (if any) is closed.
    if (claimStatus === 'Approved') {
      await connection.execute(
        "UPDATE FOUND_ITEM SET Status = 'Claimed' WHERE FoundID = ?",
        [claim.FoundID]
      );
      await connection.execute(
        `UPDATE LOST_ITEM SET Status = 'Closed'
         WHERE LostID IN (
           SELECT LostID FROM MATCH_RECORD WHERE FoundID = ? AND MatchStatus = 'Confirmed'
         )`,
        [claim.FoundID]
      );
    }

    const [updatedRows] = await connection.execute(
      'SELECT * FROM CLAIM WHERE ClaimID = ?',
      [claimId]
    );
    updatedClaim = updatedRows[0];

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  // Tell the claimant about the decision. A failed notification must not undo it.
  if (claim.ClaimStatus !== claimStatus) {
    try {
      await createNotification(
        claim.StudentID,
        `Your claim on "${itemName}" was ${claimStatus.toLowerCase()}.`
      );
    } catch (notifyErr) {
      console.error('Failed to create claim notification:', notifyErr);
    }
  }

  return updatedClaim;
}

/**
 * Look up which student reported a found item
 * @param {number} foundId
 * @returns {Promise<number>} StudentID of the reporter
 */
async function getFoundItemReporterId(foundId) {
  const [rows] = await pool.execute(
    'SELECT StudentID FROM FOUND_ITEM WHERE FoundID = ?',
    [foundId]
  );
  if (rows.length === 0) {
    const error = new Error('Found item not found');
    error.statusCode = 404;
    throw error;
  }
  return rows[0].StudentID;
}

/**
 * List every claim (newest first) with the claimant's name and the found item's name,
 * so an admin can review them in one place
 */
async function getAllClaims() {
  const [claims] = await pool.execute(
    `SELECT c.*, s.Name AS StudentName, f.ItemName AS FoundItemName
     FROM CLAIM c
     JOIN STUDENT s ON s.StudentID = c.StudentID
     JOIN FOUND_ITEM f ON f.FoundID = c.FoundID
     ORDER BY c.ClaimDate DESC, c.ClaimID DESC`
  );

  return claims;
}

module.exports = {
  createClaim,
  getClaimsByStudent,
  getClaimsByFoundItem,
  getFoundItemReporterId,
  getAllClaims,
  updateClaimStatus,
};
