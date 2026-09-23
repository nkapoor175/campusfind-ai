const pool = require('../config/db');

/**
 * List all notifications belonging to a student (newest first)
 * @param {number} studentId
 */
async function getNotificationsByStudent(studentId) {
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

  const [notifications] = await pool.execute(
    'SELECT * FROM NOTIFICATION WHERE StudentID = ? ORDER BY Date DESC, NotificationID DESC',
    [studentId]
  );

  return notifications;
}

/**
 * Mark a single notification as read
 * @param {number} notificationId
 */
async function markAsRead(notificationId) {
  // Check if notification exists
  const [notifRows] = await pool.execute(
    'SELECT NotificationID FROM NOTIFICATION WHERE NotificationID = ?',
    [notificationId]
  );
  if (notifRows.length === 0) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  await pool.execute(
    'UPDATE NOTIFICATION SET ReadStatus = true WHERE NotificationID = ?',
    [notificationId]
  );

  const [updatedRows] = await pool.execute(
    'SELECT * FROM NOTIFICATION WHERE NotificationID = ?',
    [notificationId]
  );

  return updatedRows[0];
}

/**
 * Integration function for creating a notification from a match.
 * @param {number} matchId
 * @param {number} studentId
 * @param {string} message
 */
async function createMatchNotification(matchId, studentId, message) {
  // Verify student exists
  const [studentRows] = await pool.execute(
    'SELECT StudentID FROM STUDENT WHERE StudentID = ?',
    [studentId]
  );
  if (studentRows.length === 0) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify match exists (adapted to MATCH_RECORD)
  const [matchRows] = await pool.execute(
    'SELECT MatchID FROM MATCH_RECORD WHERE MatchID = ?',
    [matchId]
  );
  if (matchRows.length === 0) {
    const error = new Error('Match not found');
    error.statusCode = 404;
    throw error;
  }

  const msg = message && String(message).trim() ? String(message).trim() : 'A potential match has been found for your item.';

  const [result] = await pool.execute(
    `INSERT INTO NOTIFICATION (Message, Date, ReadStatus, StudentID, MatchID)
     VALUES (?, NOW(), false, ?, ?)`,
    [msg, studentId, matchId]
  );

  const [newNotifRows] = await pool.execute(
    'SELECT * FROM NOTIFICATION WHERE NotificationID = ?',
    [result.insertId]
  );

  return newNotifRows[0];
}

module.exports = {
  getNotificationsByStudent,
  markAsRead,
  createMatchNotification,
};
