const notificationService = require('../services/notification.service');

/**
 * GET /api/notifications/student/:studentId
 * List notifications belonging to a student
 */
async function getNotificationsByStudent(req, res) {
  try {
    const studentId = parseInt(req.params.studentId, 10);

    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const notifications = await notificationService.getNotificationsByStudent(studentId);
    return res.status(200).json(notifications);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in getNotificationsByStudent:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark one notification as read
 */
async function markAsRead(req, res) {
  try {
    const notificationId = parseInt(req.params.id, 10);

    if (isNaN(notificationId) || notificationId <= 0) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const updatedNotification = await notificationService.markAsRead(notificationId);
    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error in markAsRead:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getNotificationsByStudent,
  markAsRead,
};
