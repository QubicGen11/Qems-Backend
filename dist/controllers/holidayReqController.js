'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();
var employeeLeaveRequest = function employeeLeaveRequest(req, res) {
    var _req$body, companyEmail, leaveType, department, startDate, endDate, duration, reason, leaveDocument, isUser, newLeaveRequest;

    return regeneratorRuntime.async(function employeeLeaveRequest$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body = req.body;
                companyEmail = _req$body.companyEmail;
                leaveType = _req$body.leaveType;
                department = _req$body.department;
                startDate = _req$body.startDate;
                endDate = _req$body.endDate;
                duration = _req$body.duration;
                reason = _req$body.reason;
                leaveDocument = _req$body.leaveDocument;
                context$1$0.prev = 9;
                context$1$0.next = 12;
                return regeneratorRuntime.awrap(prisma.user.findUnique({
                    where: {
                        email: companyEmail
                    }
                }));

            case 12:
                isUser = context$1$0.sent;

                if (isUser) {
                    context$1$0.next = 15;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('user is not found please register or login'));

            case 15:
                context$1$0.next = 17;
                return regeneratorRuntime.awrap(prisma.leaveRequests.create({
                    data: {
                        employee_id: isUser.employeeId,
                        companyEmail: isUser.email,
                        department: department,
                        leaveType: leaveType,
                        startDate: startDate,
                        endDate: endDate,
                        duration: duration,
                        reason: reason,
                        status: 'pending',
                        leaveDocument: leaveDocument
                    }
                }));

            case 17:
                newLeaveRequest = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json({ message: "leaver request submitted",
                    leaveRequest: newLeaveRequest
                }));

            case 21:
                context$1$0.prev = 21;
                context$1$0.t0 = context$1$0['catch'](9);
                return context$1$0.abrupt('return', res.status(500).send('internal server error' + context$1$0.t0.message));

            case 24:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[9, 21]]);
};
var allLeaveRequests = function allLeaveRequests(req, res) {
    var allLeaveRequest;
    return regeneratorRuntime.async(function allLeaveRequests$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(prisma.leaveRequests.findMany({}));

            case 3:
                allLeaveRequest = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).send(allLeaveRequest));

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);
                return context$1$0.abrupt('return', res.status(200).send('internal error' + context$1$0.t0.message));

            case 10:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};
var leaveRequestByDepartment = function leaveRequestByDepartment(req, res) {
    return regeneratorRuntime.async(function leaveRequestByDepartment$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                try {} catch (error) {}

            case 1:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this);
};
var approveLeaveRequests = function approveLeaveRequests(req, res) {
    var _req$body2, companyEmail, employeeEmail, leaveId, isAdmin, updatedLeave;

    return regeneratorRuntime.async(function approveLeaveRequests$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body2 = req.body;
                companyEmail = _req$body2.companyEmail;
                employeeEmail = _req$body2.employeeEmail;
                leaveId = _req$body2.leaveId;

                console.log('Approve request received:', { companyEmail: companyEmail, employeeEmail: employeeEmail, leaveId: leaveId });

                context$1$0.prev = 5;
                context$1$0.next = 8;
                return regeneratorRuntime.awrap(prisma.user.findFirst({
                    where: {
                        email: companyEmail,
                        OR: [{ role: 'Manager' }, { role: 'Admin' }]
                    }
                }));

            case 8:
                isAdmin = context$1$0.sent;

                if (isAdmin) {
                    context$1$0.next = 11;
                    break;
                }

                return context$1$0.abrupt('return', res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Only managers or admins can approve leaves'
                }));

            case 11:
                context$1$0.next = 13;
                return regeneratorRuntime.awrap(prisma.leaveRequests.update({
                    where: {
                        leave_id: leaveId // Make sure this matches your schema
                    },
                    data: {
                        status: 'Approved' // Consistent status string
                    }
                }));

            case 13:
                updatedLeave = context$1$0.sent;

                console.log('Updated leave:', updatedLeave); // Debug log

                if (updatedLeave) {
                    context$1$0.next = 17;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).json({
                    success: false,
                    message: 'No leave request found to approve'
                }));

            case 17:
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Leave request approved successfully',
                    data: updatedLeave
                }));

            case 20:
                context$1$0.prev = 20;
                context$1$0.t0 = context$1$0['catch'](5);

                console.error('Error in approveLeaveRequests:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 24:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 20]]);
};

var declineLeaveRequests = function declineLeaveRequests(req, res) {
    var _req$body3, companyEmail, employeeEmail, leaveId, isAdmin, updatedLeave;

    return regeneratorRuntime.async(function declineLeaveRequests$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body3 = req.body;
                companyEmail = _req$body3.companyEmail;
                employeeEmail = _req$body3.employeeEmail;
                leaveId = _req$body3.leaveId;

                console.log('Decline request received:', { companyEmail: companyEmail, employeeEmail: employeeEmail, leaveId: leaveId });

                context$1$0.prev = 5;
                context$1$0.next = 8;
                return regeneratorRuntime.awrap(prisma.user.findFirst({
                    where: {
                        email: companyEmail,
                        OR: [{ role: 'Manager' }, { role: 'Admin' }]
                    }
                }));

            case 8:
                isAdmin = context$1$0.sent;

                if (isAdmin) {
                    context$1$0.next = 11;
                    break;
                }

                return context$1$0.abrupt('return', res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Only managers or admins can decline leaves'
                }));

            case 11:
                context$1$0.next = 13;
                return regeneratorRuntime.awrap(prisma.leaveRequests.update({
                    where: {
                        leave_id: leaveId // Make sure this matches your schema
                    },
                    data: {
                        status: 'Rejected' // Consistent status string
                    }
                }));

            case 13:
                updatedLeave = context$1$0.sent;

                console.log('Updated leave:', updatedLeave); // Debug log

                if (updatedLeave) {
                    context$1$0.next = 17;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).json({
                    success: false,
                    message: 'No leave request found to decline'
                }));

            case 17:
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Leave request declined successfully',
                    data: updatedLeave
                }));

            case 20:
                context$1$0.prev = 20;
                context$1$0.t0 = context$1$0['catch'](5);

                console.error('Error in declineLeaveRequests:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 24:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 20]]);
};
// const updateEmployeeLeaveBalance = async (req, res) => {
//     const { employeeEmail } = req.body;

//     try {
//         // Find the employee and their leave balance by email
//         const employee = await prisma.employee.findFirst({
//             where: {
//                 companyEmail: employeeEmail
//             },
//             include: {
//                 leaveBalance: true
//             }
//         });

//         if (!employee) {
//             return res.status(404).send('Employee not found');
//         }

//         // Fetch all leave requests for the employee in a single query
//         const leaveRequests = await prisma.leaveRequests.findMany({
//             where: {
//                 employee_id: employee.employee_id
//             },
//             select: {
//                 duration: true,
//                 status: true
//             }
//         });

//         if (!leaveRequests.length) {
//             return res.status(404).send('No leave requests found for this employee');
//         }

//         // Calculate the number of each type of leave
//         const leaveCounts = leaveRequests.reduce(
//             (counts, request) => {
//                 if (request.status === 'Approved') {
//                     counts.acceptedLeaves += request.duration || 0;
//                 } else if (request.status === 'Rejected') {
//                     counts.rejectedLeaves += request.duration || 0;
//                 } else if (request.status === 'Expired') {
//                     counts.expiredLeaves += request.duration || 0;
//                 }
//                 return counts;
//             },
//             { acceptedLeaves: 0, rejectedLeaves: 0, expiredLeaves: 0 }
//         );

//         // Fetch the leave balance for the employee
//         const leaveBalance = employee.leaveBalance;

//         if (!leaveBalance) {
//             return res.status(404).send('Leave balance not found for this employee');
//         }

//         // Calculate the new total leaves
//         const newTotalLeaves = leaveBalance.totalLeaves - leaveCounts.acceptedLeaves;

//         // Update the leave balance
//         await prisma.leaveBalance.update({
//             where: {
//                 employee_id: employee.employee_id
//             },
//             data: {
//                 acceptedLeaves: leaveBalance.acceptedLeaves + leaveCounts.acceptedLeaves,
//                 rejectedLeaves: leaveBalance.rejectedLeaves + leaveCounts.rejectedLeaves,
//                 expiredLeaves: leaveBalance.expiredLeaves + leaveCounts.expiredLeaves,
//                 totalLeaves: newTotalLeaves
//             }
//         });

//         return res.status(200).send(`Leave balance updated for ${employeeEmail}`);
//     } catch (error) {
//         console.error('Internal error:', error);
//         return res.status(500).send('Internal error: ' + error.message);
//     }
// };

var createNewHoliday = function createNewHoliday(req, res) {
    var _req$body4, employeeEmail, LeaveName, LeaveType, LeaveUnit, Note, isUser, newHoliday;

    return regeneratorRuntime.async(function createNewHoliday$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body4 = req.body;
                employeeEmail = _req$body4.employeeEmail;
                LeaveName = _req$body4.LeaveName;
                LeaveType = _req$body4.LeaveType;
                LeaveUnit = _req$body4.LeaveUnit;
                Note = _req$body4.Note;
                context$1$0.prev = 6;
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(prisma.user.findFirst({
                    where: {
                        email: employeeEmail
                    }
                }));

            case 9:
                isUser = context$1$0.sent;
                context$1$0.next = 12;
                return regeneratorRuntime.awrap(prisma.leaveType.create({
                    data: {
                        LeaveName: LeaveName,
                        Type: LeaveType,
                        LeaveUnit: LeaveUnit,
                        Status: 'Active',
                        Note: Note
                    }
                }));

            case 12:
                newHoliday = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).send(newHoliday));

            case 16:
                context$1$0.prev = 16;
                context$1$0.t0 = context$1$0['catch'](6);
                return context$1$0.abrupt('return', res.status(200).send('internal error' + context$1$0.t0.message));

            case 19:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[6, 16]]);
};
var deleteHoliday = function deleteHoliday(req, res) {
    var holidayName, findHoliday, _deleteHoliday;

    return regeneratorRuntime.async(function deleteHoliday$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                holidayName = req.params.holidayName;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.leaveType.findFirst({
                    where: {
                        LeaveName: holidayName
                    }
                }));

            case 4:
                findHoliday = context$1$0.sent;
                context$1$0.next = 7;
                return regeneratorRuntime.awrap(prisma.leaveType['delete']({
                    where: {
                        id: findHoliday.id
                    }
                }));

            case 7:
                _deleteHoliday = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).send('Holiday deleted'));

            case 11:
                context$1$0.prev = 11;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).send('Internal error: ' + context$1$0.t0.message));

            case 14:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 11]]);
};

var allHolidays = function allHolidays(req, res) {
    var _allHolidays;

    return regeneratorRuntime.async(function allHolidays$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(prisma.leaveType.findMany({}));

            case 3:
                _allHolidays = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).send(_allHolidays));

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);
                return context$1$0.abrupt('return', res.status(500).send('Internal error: ' + context$1$0.t0.message));

            case 10:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};

var leaveRequestByEmail = function leaveRequestByEmail(req, res) {
    var email, leaveRequests;
    return regeneratorRuntime.async(function leaveRequestByEmail$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                email = req.params.email;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.leaveRequests.findMany({
                    where: {
                        companyEmail: email
                    }
                }));

            case 4:
                leaveRequests = context$1$0.sent;

                if (leaveRequests.length) {
                    context$1$0.next = 7;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).json({ message: 'No leave requests found for this email' }));

            case 7:
                return context$1$0.abrupt('return', res.status(200).json(leaveRequests));

            case 10:
                context$1$0.prev = 10;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error fetching leave requests by email:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    error: 'Internal Server Error',
                    message: context$1$0.t0.message
                }));

            case 14:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 10]]);
};

module.exports = { employeeLeaveRequest: employeeLeaveRequest, allLeaveRequests: allLeaveRequests, approveLeaveRequests: approveLeaveRequests, declineLeaveRequests: declineLeaveRequests, createNewHoliday: createNewHoliday, deleteHoliday: deleteHoliday, allHolidays: allHolidays, leaveRequestByEmail: leaveRequestByEmail };

// Verify admin/manager status

// Update the leave request - Fixed the update query

// Verify admin/manager status

// Update the leave request - Fixed the update query