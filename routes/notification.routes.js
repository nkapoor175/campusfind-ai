const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// GET /api/notifications/student/:studentId - List notifications for a student
router.get('/student/:studentId', notificationController.getNotificationsByStudent);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
