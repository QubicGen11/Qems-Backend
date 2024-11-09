const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { sendNotificationToEmployees } = require('../controllers/notificationController');

// Get notifications
router.get('/notifications/:employeeId', notificationController.getNotifications);

// Mark as read
router.put('/notifications/:notificationId/read', notificationController.markNotificationAsRead);

// Mark all as read
router.put('/notifications/markAllRead/:employeeId', notificationController.markAllAsRead);

// Add this test route
router.post('/notifications/test/:employeeId', notificationController.createTestNotification);

// Add this new route
router.post('/notifications/create', notificationController.createNotification);

// Add this new route
router.post('/notifications/bulk', sendNotificationToEmployees);

module.exports = router; 