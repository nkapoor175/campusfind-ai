const pool = require('../config/db');

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
    'SELECT ClaimID FROM CLAIM WHERE ClaimID = ?',
    [claimId]
  );
  if (claimRows.length === 0) {
    const error = new Error('Claim not found');
    error.statusCode = 404;
    throw error;
  }

  const notes = (verificationNotes !== undefined && verificationNotes !== null)
    ? String(verificationNotes).trim()
    : null;

  // Update claim
  await pool.execute(
    `UPDATE CLAIM 
     SET ClaimStatus = ?, VerificationNotes = ?, AdminID = ? 
     WHERE ClaimID = ?`,
    [claimStatus, notes, adminId, claimId]
  );

  const [updatedRows] = await pool.execute(
    'SELECT * FROM CLAIM WHERE ClaimID = ?',
    [claimId]
  );

  return updatedRows[0];
}

module.exports = {
  createClaim,
  getClaimsByStudent,
  getClaimsByFoundItem,
  updateClaimStatus,
};
