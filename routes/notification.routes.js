const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications/student/:studentId - List notifications for a student (that student, or an admin)
router.get('/student/:studentId', authenticate, notificationController.getNotificationsByStudent);

// PUT /api/notifications/:id/read - Mark a notification as read (its owner, or an admin)
router.put('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;
