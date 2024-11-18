'use strict';

var _this = this;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

// Get employee by ID
var getEmployeeById = function getEmployeeById(req, res) {
    var id, employee, formattedEmployee;
    return regeneratorRuntime.async(function getEmployeeById$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                id = req.params.id;
                context$1$0.prev = 1;

                // Log the incoming request
                console.log('Fetching employee with ID:', id);

                context$1$0.next = 5;
                return regeneratorRuntime.awrap(prisma.employee.findUnique({
                    where: {
                        employee_id: id
                    }
                }));

            case 5:
                employee = context$1$0.sent;

                console.log('Found employee:', employee); // Debug log

                if (employee) {
                    context$1$0.next = 9;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).json({
                    success: false,
                    message: 'Employee not found with ID: ' + id
                }));

            case 9:
                formattedEmployee = {
                    employee_id: employee.employee_id,
                    firstName: employee.firstName || '',
                    lastName: employee.lastName || '',
                    companyEmail: employee.companyEmail,
                    department: employee.department,
                    profileImage: employee.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(employee.firstName || '') + '+' + encodeURIComponent(employee.lastName || '') + '&size=200&background=random',
                    position: employee.position
                };
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: formattedEmployee
                }));

            case 13:
                context$1$0.prev = 13;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error in getEmployeeById:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 17:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 13]]);
};

// Get employee by email
var getEmployeeByEmail = function getEmployeeByEmail(req, res) {
    var email, employee, formattedEmployee;
    return regeneratorRuntime.async(function getEmployeeByEmail$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                email = req.params.email;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    where: {
                        companyEmail: email
                    },
                    select: {
                        employee_id: true,
                        firstName: true,
                        lastName: true,
                        companyEmail: true,
                        department: true,
                        profileImage: true,
                        position: true,
                        role: true,
                        phoneNumber: true,
                        dateOfJoining: true,
                        status: true
                    }
                }));

            case 4:
                employee = context$1$0.sent;

                if (employee) {
                    context$1$0.next = 7;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).json({
                    success: false,
                    message: 'Employee not found'
                }));

            case 7:
                formattedEmployee = _extends({}, employee, {
                    fullName: employee.firstName + ' ' + employee.lastName,
                    dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString() : null,
                    profileImage: employee.profileImage || 'https://ui-avatars.com/api/?name=' + employee.firstName + '+' + employee.lastName + '&background=random'
                });
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: formattedEmployee
                }));

            case 11:
                context$1$0.prev = 11;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error fetching employee:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 15:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 11]]);
};

// Update employee profile image
var updateEmployeeImage = function updateEmployeeImage(req, res) {
    var id, profileImage, updatedEmployee;
    return regeneratorRuntime.async(function updateEmployeeImage$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                id = req.params.id;
                profileImage = req.body.profileImage;
                context$1$0.prev = 2;
                context$1$0.next = 5;
                return regeneratorRuntime.awrap(prisma.employee.update({
                    where: {
                        employee_id: id
                    },
                    data: {
                        profileImage: profileImage
                    },
                    select: {
                        employee_id: true,
                        profileImage: true
                    }
                }));

            case 5:
                updatedEmployee = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Profile image updated successfully',
                    data: updatedEmployee
                }));

            case 9:
                context$1$0.prev = 9;
                context$1$0.t0 = context$1$0['catch'](2);

                console.error('Error updating profile image:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to update profile image',
                    error: context$1$0.t0.message
                }));

            case 13:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[2, 9]]);
};

// Employee Leave Request function
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
                return context$1$0.abrupt('return', res.status(200).json({
                    message: "leave request submitted",
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

var employeeLeaveStatus = function employeeLeaveStatus(req, res) {
    var employeeEmail, isEmployee, leaveRequests;
    return regeneratorRuntime.async(function employeeLeaveStatus$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employeeEmail = req.body.employeeEmail;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    where: {
                        companyEmail: employeeEmail
                    }
                }));

            case 4:
                isEmployee = context$1$0.sent;

                if (isEmployee) {
                    context$1$0.next = 7;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('employee data not available'));

            case 7:
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(prisma.leaveRequests.findMany({
                    where: {
                        employee_id: isEmployee.employee_id
                    },
                    select: {
                        status: true,
                        startDate: true,
                        endDate: true,
                        leaveType: true,
                        reason: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }));

            case 9:
                leaveRequests = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json(leaveRequests));

            case 13:
                context$1$0.prev = 13;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).send('Internal error: ' + context$1$0.t0.message));

            case 16:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 13]]);
};

var getLeaveRequestsByEmail = function getLeaveRequestsByEmail(req, res) {
    var email, leaveRequests;
    return regeneratorRuntime.async(function getLeaveRequestsByEmail$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                email = req.params.email;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.leaveRequests.findMany({
                    where: {
                        companyEmail: email
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }));

            case 4:
                leaveRequests = context$1$0.sent;

                if (leaveRequests) {
                    context$1$0.next = 7;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).json({ message: 'No leave requests found' }));

            case 7:
                return context$1$0.abrupt('return', res.status(200).json(leaveRequests));

            case 10:
                context$1$0.prev = 10;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).send('Internal error: ' + context$1$0.t0.message));

            case 13:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 10]]);
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
                return context$1$0.abrupt('return', res.status(500).send('internal error' + context$1$0.t0.message));

            case 10:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
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
                return regeneratorRuntime.awrap(prisma.leaveRequests.updateMany({
                    where: {
                        leave_id: parseInt(leaveId),
                        companyEmail: employeeEmail,
                        status: {
                            'in': ['Pending', 'pending']
                        }
                    },
                    data: {
                        status: 'Approved'
                    }
                }));

            case 13:
                updatedLeave = context$1$0.sent;

                if (!(updatedLeave.count === 0)) {
                    context$1$0.next = 16;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).json({
                    success: false,
                    message: 'No pending leave request found to approve'
                }));

            case 16:
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Leave request approved successfully'
                }));

            case 19:
                context$1$0.prev = 19;
                context$1$0.t0 = context$1$0['catch'](5);

                console.error('Error in approveLeaveRequests:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 23:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 19]]);
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
                return regeneratorRuntime.awrap(prisma.leaveRequests.updateMany({
                    where: {
                        leave_id: parseInt(leaveId),
                        companyEmail: employeeEmail,
                        status: {
                            'in': ['Pending', 'pending']
                        }
                    },
                    data: {
                        status: 'Rejected'
                    }
                }));

            case 13:
                updatedLeave = context$1$0.sent;

                if (!(updatedLeave.count === 0)) {
                    context$1$0.next = 16;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).json({
                    success: false,
                    message: 'No pending leave request found to decline'
                }));

            case 16:
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Leave request declined successfully'
                }));

            case 19:
                context$1$0.prev = 19;
                context$1$0.t0 = context$1$0['catch'](5);

                console.error('Error in declineLeaveRequests:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 23:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 19]]);
};

var createNewHoliday = function createNewHoliday(req, res) {
    var _req$body4, name, date, description, type, newHoliday;

    return regeneratorRuntime.async(function createNewHoliday$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body4 = req.body;
                name = _req$body4.name;
                date = _req$body4.date;
                description = _req$body4.description;
                type = _req$body4.type;
                context$1$0.prev = 5;
                context$1$0.next = 8;
                return regeneratorRuntime.awrap(prisma.holidays.create({
                    data: {
                        name: name,
                        date: new Date(date),
                        description: description,
                        type: type
                    }
                }));

            case 8:
                newHoliday = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(201).json({
                    success: true,
                    message: 'Holiday created successfully',
                    data: newHoliday
                }));

            case 12:
                context$1$0.prev = 12;
                context$1$0.t0 = context$1$0['catch'](5);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to create holiday',
                    error: context$1$0.t0.message
                }));

            case 15:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 12]]);
};

var deleteHoliday = function deleteHoliday(req, res) {
    var holidayName;
    return regeneratorRuntime.async(function deleteHoliday$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                holidayName = req.params.holidayName;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.holidays['delete']({
                    where: {
                        name: holidayName
                    }
                }));

            case 4:
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    message: 'Holiday deleted successfully'
                }));

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to delete holiday',
                    error: context$1$0.t0.message
                }));

            case 10:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 7]]);
};

var allHolidays = function allHolidays(req, res) {
    var holidays;
    return regeneratorRuntime.async(function allHolidays$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(prisma.holidays.findMany({
                    orderBy: {
                        date: 'asc'
                    }
                }));

            case 3:
                holidays = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: holidays
                }));

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to fetch holidays',
                    error: context$1$0.t0.message
                }));

            case 10:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};

// New function to get leave statistics
var getLeaveStatistics = function getLeaveStatistics(req, res) {
    var employeeId, leaveStats;
    return regeneratorRuntime.async(function getLeaveStatistics$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employeeId = req.params.employeeId;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.leaveRequests.groupBy({
                    by: ['status'],
                    where: {
                        employee_id: employeeId
                    },
                    _count: {
                        status: true
                    }
                }));

            case 4:
                leaveStats = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: leaveStats
                }));

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to fetch leave statistics',
                    error: context$1$0.t0.message
                }));

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 8]]);
};

// New function to get department leave summary
var getDepartmentLeavesSummary = function getDepartmentLeavesSummary(req, res) {
    var department, departmentLeaves;
    return regeneratorRuntime.async(function getDepartmentLeavesSummary$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                department = req.params.department;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.leaveRequests.findMany({
                    where: {
                        department: department
                    },
                    include: {
                        employee: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: {
                        startDate: 'desc'
                    }
                }));

            case 4:
                departmentLeaves = context$1$0.sent;
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: departmentLeaves
                }));

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Failed to fetch department leaves',
                    error: context$1$0.t0.message
                }));

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 8]]);
};

// Export all functions
module.exports = {
    employeeLeaveRequest: employeeLeaveRequest,
    allLeaveRequests: allLeaveRequests,
    approveLeaveRequests: approveLeaveRequests,
    declineLeaveRequests: declineLeaveRequests,
    createNewHoliday: createNewHoliday,
    deleteHoliday: deleteHoliday,
    allHolidays: allHolidays,
    getLeaveRequestsByEmail: getLeaveRequestsByEmail,
    employeeLeaveStatus: employeeLeaveStatus,
    getEmployeeById: getEmployeeById,
    getEmployeeByEmail: getEmployeeByEmail,
    updateEmployeeImage: updateEmployeeImage,
    getLeaveStatistics: getLeaveStatistics,
    getDepartmentLeavesSummary: getDepartmentLeavesSummary
};

// Format the response

// Verify admin/manager status

// Update the leave request

// Verify admin/manager status

// Update the leave request