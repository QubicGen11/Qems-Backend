'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

// Get notifications for an employee
var getNotifications = function getNotifications(req, res) {
    var employeeId, notifications;
    return regeneratorRuntime.async(function getNotifications$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                employeeId = req.params.employeeId;

                console.log('Fetching notifications for employee:', employeeId);

                context$1$0.next = 5;
                return regeneratorRuntime.awrap(prisma.notification.findMany({
                    where: {
                        employeeId: employeeId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 50 // Limit to last 50 notifications
                }));

            case 5:
                notifications = context$1$0.sent;

                console.log('Found notifications:', notifications);
                res.json(notifications);
                context$1$0.next = 14;
                break;

            case 10:
                context$1$0.prev = 10;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error in getNotifications:', context$1$0.t0);
                res.status(500).json({
                    error: 'Failed to fetch notifications',
                    details: context$1$0.t0.message
                });

            case 14:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 10]]);
};

// Mark single notification as read
var markNotificationAsRead = function markNotificationAsRead(req, res) {
    var notificationId;
    return regeneratorRuntime.async(function markNotificationAsRead$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                notificationId = req.params.notificationId;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.notification.update({
                    where: {
                        id: notificationId
                    },
                    data: {
                        isRead: true
                    }
                }));

            case 4:

                res.json({ success: true });
                context$1$0.next = 11;
                break;

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error marking notification as read:', context$1$0.t0);
                res.status(500).json({ error: 'Failed to mark notification as read' });

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};

// Mark all notifications as read
var markAllAsRead = function markAllAsRead(req, res) {
    var employeeId;
    return regeneratorRuntime.async(function markAllAsRead$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                employeeId = req.params.employeeId;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.notification.updateMany({
                    where: {
                        employeeId: employeeId,
                        isRead: false
                    },
                    data: {
                        isRead: true
                    }
                }));

            case 4:

                res.json({ success: true });
                context$1$0.next = 11;
                break;

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error marking all notifications as read:', context$1$0.t0);
                res.status(500).json({ error: 'Failed to mark all notifications as read' });

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};

// Add this function to test notifications
var createTestNotification = function createTestNotification(req, res) {
    var employeeId, notification;
    return regeneratorRuntime.async(function createTestNotification$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                employeeId = req.params.employeeId;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.notification.create({
                    data: {
                        employeeId: employeeId,
                        message: "This is a test notification",
                        type: "TEST",
                        isRead: false
                    }
                }));

            case 4:
                notification = context$1$0.sent;

                res.json(notification);
                context$1$0.next = 12;
                break;

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error creating test notification:', context$1$0.t0);
                res.status(500).json({ error: 'Failed to create test notification' });

            case 12:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 8]]);
};

// Add this new function
var createNotification = function createNotification(req, res) {
    var _req$body, employeeId, message, type, _req$body$isRead, isRead, notification;

    return regeneratorRuntime.async(function createNotification$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                _req$body = req.body;
                employeeId = _req$body.employeeId;
                message = _req$body.message;
                type = _req$body.type;
                _req$body$isRead = _req$body.isRead;
                isRead = _req$body$isRead === undefined ? false : _req$body$isRead;

                console.log('Creating notification:', { employeeId: employeeId, message: message, type: type, isRead: isRead });

                context$1$0.next = 10;
                return regeneratorRuntime.awrap(prisma.notification.create({
                    data: {
                        employeeId: employeeId,
                        message: message,
                        type: type,
                        isRead: isRead
                    }
                }));

            case 10:
                notification = context$1$0.sent;

                console.log('Created notification:', notification);
                res.json(notification);
                context$1$0.next = 19;
                break;

            case 15:
                context$1$0.prev = 15;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error creating notification:', context$1$0.t0);
                res.status(500).json({
                    error: 'Failed to create notification',
                    details: context$1$0.t0.message
                });

            case 19:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 15]]);
};

var sendNotificationToEmployees = function sendNotificationToEmployees(req, res) {
    var _ret;

    return regeneratorRuntime.async(function sendNotificationToEmployees$(context$1$0) {
        var _this2 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap((function callee$1$0() {
                    var _req$body2, employeeIds, message, _req$body2$type, type, notifications;

                    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                _req$body2 = req.body;
                                employeeIds = _req$body2.employeeIds;
                                message = _req$body2.message;
                                _req$body2$type = _req$body2.type;
                                type = _req$body2$type === undefined ? 'GENERAL_MESSAGE' : _req$body2$type;

                                if (!(!Array.isArray(employeeIds) || !message)) {
                                    context$2$0.next = 7;
                                    break;
                                }

                                return context$2$0.abrupt('return', {
                                    v: res.status(400).json({
                                        success: false,
                                        message: 'Invalid request. Please provide employeeIds array and message'
                                    })
                                });

                            case 7:
                                context$2$0.next = 9;
                                return regeneratorRuntime.awrap(Promise.all(employeeIds.map(function (employeeId) {
                                    return prisma.notification.create({
                                        data: {
                                            employeeId: employeeId,
                                            message: message,
                                            type: type,
                                            isRead: false
                                        }
                                    });
                                })));

                            case 9:
                                notifications = context$2$0.sent;
                                return context$2$0.abrupt('return', {
                                    v: res.status(201).json({
                                        success: true,
                                        message: 'Notifications sent successfully',
                                        data: notifications
                                    })
                                });

                            case 11:
                            case 'end':
                                return context$2$0.stop();
                        }
                    }, null, _this2);
                })());

            case 3:
                _ret = context$1$0.sent;

                if (!(typeof _ret === 'object')) {
                    context$1$0.next = 6;
                    break;
                }

                return context$1$0.abrupt('return', _ret.v);

            case 6:
                context$1$0.next = 12;
                break;

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error sending notifications:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to send notifications',
                    error: context$1$0.t0.message
                }));

            case 12:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 8]]);
};

module.exports = {
    getNotifications: getNotifications,
    markNotificationAsRead: markNotificationAsRead,
    markAllAsRead: markAllAsRead,
    createTestNotification: createTestNotification,
    createNotification: createNotification,
    sendNotificationToEmployees: sendNotificationToEmployees
};

// Create notifications for all selected employees