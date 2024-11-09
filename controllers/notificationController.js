const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get notifications for an employee
const getNotifications = async (req, res) => {
    try {
        const { employeeId } = req.params;
        console.log('Fetching notifications for employee:', employeeId);

        const notifications = await prisma.notification.findMany({
            where: {
                employeeId: employeeId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to last 50 notifications
        });
        
        console.log('Found notifications:', notifications);
        res.json(notifications);
    } catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({ 
            error: 'Failed to fetch notifications',
            details: error.message 
        });
    }
};

// Mark single notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                isRead: true
            }
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        await prisma.notification.updateMany({
            where: {
                employeeId: employeeId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};

// Add this function to test notifications
const createTestNotification = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const notification = await prisma.notification.create({
            data: {
                employeeId,
                message: "This is a test notification",
                type: "TEST",
                isRead: false
            }
        });
        
        res.json(notification);
    } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({ error: 'Failed to create test notification' });
    }
};

// Add this new function
const createNotification = async (req, res) => {
    try {
        const { employeeId, message, type, isRead = false } = req.body;
        
        console.log('Creating notification:', { employeeId, message, type, isRead });

        const notification = await prisma.notification.create({
            data: {
                employeeId,
                message,
                type,
                isRead
            }
        });
        
        console.log('Created notification:', notification);
        res.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ 
            error: 'Failed to create notification',
            details: error.message 
        });
    }
};

const sendNotificationToEmployees = async (req, res) => {
  try {
    const { employeeIds, message, type = 'GENERAL_MESSAGE' } = req.body;

    if (!Array.isArray(employeeIds) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Please provide employeeIds array and message'
      });
    }

    // Create notifications for all selected employees
    const notifications = await Promise.all(
      employeeIds.map(employeeId =>
        prisma.notification.create({
          data: {
            employeeId,
            message,
            type,
            isRead: false
          }
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: 'Notifications sent successfully',
      data: notifications
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllAsRead,
    createTestNotification,
    createNotification,
    sendNotificationToEmployees
};
