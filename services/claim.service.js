const pool = require('../config/db');

/**
 * File a claim for a found item
 * @param {number} studentId 
 * @param {number} foundId 
 */
async function createClaim(studentId, foundId, lostId = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [items] = await connection.execute('SELECT * FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [foundId]);
    if (!items.length) throw claimError(404, 'Found item not found');
    const item = items[0];
    if (item.Status !== 'Open' || !item.AdminID) throw claimError(409, 'Only verified, available items can be claimed');
    if (item.StudentID === studentId) throw claimError(409, 'You cannot claim your own found report');
    if (lostId === null) {
      const [links] = await connection.execute("SELECT l.LostID FROM MATCH_RECORD m JOIN LOST_ITEM l ON l.LostID = m.LostID WHERE m.FoundID = ? AND m.MatchStatus = 'Confirmed' AND l.StudentID = ?", [foundId, studentId]);
      lostId = links[0]?.LostID || null;
    }
    if (lostId !== null) {
      const [lost] = await connection.execute('SELECT * FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [lostId]);
      if (!lost.length || lost[0].StudentID !== studentId) throw claimError(403, 'Select your own lost report');
      if (!lost[0].AdminID || !['Open', 'Matched'].includes(lost[0].Status)) throw claimError(409, 'Lost report must be verified and active');
      const [winners] = await connection.execute("SELECT ClaimID FROM CLAIM WHERE LostID = ? AND ClaimStatus = 'Approved' FOR UPDATE", [lostId]);
      if (winners.length) throw claimError(409, 'Lost report already has an approved claim');
      const [other] = await connection.execute("SELECT MatchID FROM MATCH_RECORD WHERE LostID = ? AND FoundID <> ? AND MatchStatus = 'Confirmed'", [lostId, foundId]);
      if (other.length) throw claimError(409, 'Lost report is matched to a different item');
    }
    const [duplicates] = await connection.execute("SELECT ClaimID FROM CLAIM WHERE StudentID = ? AND FoundID = ? AND ClaimStatus = 'Pending'", [studentId, foundId]);
    if (duplicates.length) throw claimError(409, 'A pending claim already exists for this item');
    const [result] = await connection.execute("INSERT INTO CLAIM (ClaimDate, ClaimStatus, StudentID, FoundID, LostID) VALUES (NOW(), 'Pending', ?, ?, ?)", [studentId, foundId, lostId]);
    const [rows] = await connection.execute('SELECT * FROM CLAIM WHERE ClaimID = ?', [result.insertId]);
    await connection.commit();
    return rows[0];
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally { connection.release(); }
}

function claimError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // All claim writers lock the found item first, then the claim rows.
    const [refs] = await connection.execute('SELECT FoundID FROM CLAIM WHERE ClaimID = ?', [claimId]);
    if (!refs.length) throw claimError(404, 'Claim not found');
    const [items] = await connection.execute('SELECT * FROM FOUND_ITEM WHERE FoundID = ? FOR UPDATE', [refs[0].FoundID]);
    const [claims] = await connection.execute('SELECT * FROM CLAIM WHERE ClaimID = ? FOR UPDATE', [claimId]);
    if (!claims.length) throw claimError(404, 'Claim not found');
    const claim = claims[0];
    const item = items[0];
    if (claim.ClaimStatus !== 'Pending') throw claimError(409, 'Claim is already decided');
    if (claimStatus === 'Approved' && (item.Status !== 'Open' || !item.AdminID)) throw claimError(409, 'Item must be verified and available');
    const notes = verificationNotes == null ? claim.VerificationNotes : String(verificationNotes).trim();
    await connection.execute('UPDATE CLAIM SET ClaimStatus = ?, VerificationNotes = ?, AdminID = ? WHERE ClaimID = ?', [claimStatus, notes, adminId, claimId]);
    if (claimStatus === 'Approved') {
      if (claim.LostID) {
        const [lost] = await connection.execute('SELECT * FROM LOST_ITEM WHERE LostID = ? FOR UPDATE', [claim.LostID]);
        const [otherWinners] = await connection.execute("SELECT ClaimID FROM CLAIM WHERE LostID = ? AND ClaimStatus = 'Approved' AND ClaimID <> ? FOR UPDATE", [claim.LostID, claimId]);
        const [differentMatch] = await connection.execute("SELECT MatchID FROM MATCH_RECORD WHERE LostID = ? AND FoundID <> ? AND MatchStatus = 'Confirmed' FOR UPDATE", [claim.LostID, claim.FoundID]);
        if (differentMatch.length) throw claimError(409, 'Linked report is matched to a different item');
        if (otherWinners.length) throw claimError(409, 'Linked lost report already has an approved claim');
        if (!lost.length || lost[0].StudentID !== claim.StudentID || !lost[0].AdminID || !['Open', 'Matched'].includes(lost[0].Status)) throw claimError(409, 'Linked lost report is no longer available');
      }
      await connection.execute("UPDATE FOUND_ITEM SET Status = 'Claimed' WHERE FoundID = ?", [claim.FoundID]);
      const [superseded] = await connection.execute("SELECT LostID FROM MATCH_RECORD WHERE FoundID = ? AND LostID <> COALESCE(?, 0) AND MatchStatus = 'Confirmed'", [claim.FoundID, claim.LostID]);
      await connection.execute("UPDATE MATCH_RECORD SET MatchStatus = 'Rejected' WHERE FoundID = ? AND LostID <> COALESCE(?, 0)", [claim.FoundID, claim.LostID]);
      for (const previous of superseded) await connection.execute("UPDATE LOST_ITEM SET Status = 'Open' WHERE LostID = ? AND Status = 'Matched' AND NOT EXISTS (SELECT 1 FROM MATCH_RECORD WHERE LostID = ? AND MatchStatus = 'Confirmed')", [previous.LostID, previous.LostID]);
      // Reserve the linked report until pickup; close it only when returned.
      await connection.execute("UPDATE LOST_ITEM SET Status = 'Matched' WHERE LostID = ? AND Status = 'Open'", [claim.LostID]);
      const [others] = await connection.execute("SELECT StudentID FROM CLAIM WHERE FoundID = ? AND ClaimID <> ? AND ClaimStatus = 'Pending' FOR UPDATE", [claim.FoundID, claimId]);
      await connection.execute("UPDATE CLAIM SET ClaimStatus = 'Rejected', VerificationNotes = 'Item approved for another claimant.', AdminID = ? WHERE FoundID = ? AND ClaimID <> ? AND ClaimStatus = 'Pending'", [adminId, claim.FoundID, claimId]);
      for (const other of others) await queueClaimNotice(connection, other.StudentID, `Your claim on "${item.ItemName}" was rejected: another ownership claim was approved.`);
    }
    await queueClaimNotice(connection, claim.StudentID, `Your claim on "${item.ItemName}" was ${claimStatus.toLowerCase()}.${claimStatus === 'Approved' ? ' Ready to collect at Campus Security with your student ID.' : ''}`);
    const [rows] = await connection.execute('SELECT * FROM CLAIM WHERE ClaimID = ?', [claimId]);
    await connection.commit();
    return rows[0];
  } catch (err) { await connection.rollback(); throw err; }
  finally { connection.release(); }
}

async function queueClaimNotice(connection, studentId, message) {
  await connection.execute('INSERT INTO NOTIFICATION (Message, StudentID, MatchID) VALUES (?, ?, NULL)', [message.slice(0, 500), studentId]);
}

async function updateClaimNotes(claimId, notes) {
  if (typeof notes !== 'string' || notes.length > 5000) throw claimError(400, 'Notes must be text of at most 5000 characters');
  const [result] = await pool.execute("UPDATE CLAIM SET VerificationNotes = ? WHERE ClaimID = ? AND ClaimStatus = 'Pending'", [notes.trim(), claimId]);
  if (!result.affectedRows) throw claimError(409, 'Only pending claim notes can be edited');
  return { message: 'Note saved' };
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
  updateClaimNotes,
};
