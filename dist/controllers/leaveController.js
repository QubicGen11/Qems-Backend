'use strict';

var _this = this;

var approveLeave = function approveLeave(req, res) {
  var _req$body, companyEmail, employeeEmail, leaveId, updatedLeave;

  return regeneratorRuntime.async(function approveLeave$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        _req$body = req.body;
        companyEmail = _req$body.companyEmail;
        employeeEmail = _req$body.employeeEmail;
        leaveId = _req$body.leaveId;
        context$1$0.next = 7;
        return regeneratorRuntime.awrap(prisma.leaveRequest.update({
          where: {
            leave_id: leaveId
          },
          data: {
            status: 'Approved'
          },
          include: {
            employee: true // Include employee details
          }
        }));

      case 7:
        updatedLeave = context$1$0.sent;
        context$1$0.next = 10;
        return regeneratorRuntime.awrap(prisma.notification.create({
          data: {
            employeeId: updatedLeave.employee.employee_id,
            message: 'Your leave request from ' + new Date(updatedLeave.startDate).toLocaleDateString() + ' to ' + new Date(updatedLeave.endDate).toLocaleDateString() + ' has been approved',
            type: 'LEAVE_APPROVED',
            isRead: false
          }
        }));

      case 10:

        res.json({
          success: true,
          employeeId: updatedLeave.employee.employee_id
        });
        context$1$0.next = 17;
        break;

      case 13:
        context$1$0.prev = 13;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error approving leave:', context$1$0.t0);
        res.status(500).json({
          success: false,
          message: 'Failed to approve leave request'
        });

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 13]]);
};

var declineLeave = function declineLeave(req, res) {
  var _req$body2, companyEmail, employeeEmail, leaveId, updatedLeave;

  return regeneratorRuntime.async(function declineLeave$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        _req$body2 = req.body;
        companyEmail = _req$body2.companyEmail;
        employeeEmail = _req$body2.employeeEmail;
        leaveId = _req$body2.leaveId;
        context$1$0.next = 7;
        return regeneratorRuntime.awrap(prisma.leaveRequest.update({
          where: {
            leave_id: leaveId
          },
          data: {
            status: 'Rejected'
          },
          include: {
            employee: true // Include employee details
          }
        }));

      case 7:
        updatedLeave = context$1$0.sent;
        context$1$0.next = 10;
        return regeneratorRuntime.awrap(prisma.notification.create({
          data: {
            employeeId: updatedLeave.employee.employee_id,
            message: 'Your leave request from ' + new Date(updatedLeave.startDate).toLocaleDateString() + ' to ' + new Date(updatedLeave.endDate).toLocaleDateString() + ' has been rejected',
            type: 'LEAVE_REJECTED',
            isRead: false
          }
        }));

      case 10:

        res.json({
          success: true,
          employeeId: updatedLeave.employee.employee_id
        });
        context$1$0.next = 17;
        break;

      case 13:
        context$1$0.prev = 13;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error declining leave:', context$1$0.t0);
        res.status(500).json({
          success: false,
          message: 'Failed to decline leave request'
        });

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 13]]);
};

module.exports = {
  approveLeave: approveLeave,
  declineLeave: declineLeave
};

// Your existing leave approval logic

// Create notification

// Your existing leave rejection logic

// Create notification