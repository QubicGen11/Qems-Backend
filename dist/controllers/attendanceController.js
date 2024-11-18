'use strict';

var _this = this;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var clockIn = function clockIn(req, res) {
  var email, user, today, existingAttendance, attendance;
  return regeneratorRuntime.async(function clockIn$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        email = req.body.email;

        console.log('ClockIn request received with email: ' + email);

        // Check if user exists
        context$1$0.next = 5;
        return regeneratorRuntime.awrap(prisma.user.findFirst({ where: { email: email } }));

      case 5:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 8;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found. Please login or register as a user.' }));

      case 8:
        today = new Date();

        today.setHours(0, 0, 0, 0);

        context$1$0.next = 12;
        return regeneratorRuntime.awrap(prisma.attendance.findFirst({
          where: {
            companyEmail: email,
            date: {
              gte: today
            },
            checkout_Time: null
          }
        }));

      case 12:
        existingAttendance = context$1$0.sent;

        if (!existingAttendance) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'Already clocked in today.' }));

      case 15:
        context$1$0.next = 17;
        return regeneratorRuntime.awrap(prisma.attendance.create({
          data: {
            employeeId: user.employeeId,
            checkin_Time: new Date(),
            companyEmail: email,
            status: 'pending',
            employeeName: user.username,
            joinDate: user.joiningDate,
            date: new Date()
          }
        }));

      case 17:
        attendance = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).json({
          message: 'Clock-in successful',
          attendance: attendance,
          isClockedIn: true,
          clockInTime: attendance.checkin_Time
        }));

      case 21:
        context$1$0.prev = 21;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error clocking in:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 21]]);
};

var employeeReport = function employeeReport(req, res) {
  var _req$body, email, reportText, user, latestAttendance, mediaUrls, attendance;

  return regeneratorRuntime.async(function employeeReport$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        _req$body = req.body;
        email = _req$body.email;
        reportText = _req$body.reportText;

        console.log('Report submission request received with email: ' + email);

        context$1$0.next = 7;
        return regeneratorRuntime.awrap(prisma.user.findFirst({ where: { email: email } }));

      case 7:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 10;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found.' }));

      case 10:
        context$1$0.next = 12;
        return regeneratorRuntime.awrap(prisma.attendance.findFirst({
          where: {
            companyEmail: email,
            checkout_Time: null
          },
          orderBy: {
            checkin_Time: 'desc'
          }
        }));

      case 12:
        latestAttendance = context$1$0.sent;

        if (latestAttendance) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'No active clock-in record found.' }));

      case 15:
        mediaUrls = extractMediaUrls(reportText);
        context$1$0.next = 18;
        return regeneratorRuntime.awrap(prisma.attendance.update({
          where: {
            id: latestAttendance.id
          },
          data: {
            reports: reportText,
            reportMedia: mediaUrls
          }
        }));

      case 18:
        attendance = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Report submission successful', attendance: attendance }));

      case 22:
        context$1$0.prev = 22;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error submitting report:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 22]]);
};

// Helper function to extract media URLs
var extractMediaUrls = function extractMediaUrls(content) {
  var imgRegex = /<img[^>]+src="([^">]+)"/g;
  var videoRegex = /<iframe[^>]+src="([^">]+)"/g;

  var urls = [];
  var match = undefined;

  while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  while ((match = videoRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
};

var clockOut = function clockOut(req, res) {
  var email, user, today, activeAttendance, attendance;
  return regeneratorRuntime.async(function clockOut$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        email = req.body.email;

        console.log('ClockOut request received with email: ' + email);

        context$1$0.next = 5;
        return regeneratorRuntime.awrap(prisma.user.findFirst({ where: { email: email } }));

      case 5:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 8;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found.' }));

      case 8:
        today = new Date();

        today.setHours(0, 0, 0, 0);

        context$1$0.next = 12;
        return regeneratorRuntime.awrap(prisma.attendance.findFirst({
          where: {
            companyEmail: email,
            date: {
              gte: today
            },
            checkout_Time: null
          }
        }));

      case 12:
        activeAttendance = context$1$0.sent;

        if (activeAttendance) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'No active clock-in record found.' }));

      case 15:
        context$1$0.next = 17;
        return regeneratorRuntime.awrap(prisma.attendance.update({
          where: {
            id: activeAttendance.id
          },
          data: {
            checkout_Time: new Date()
          }
        }));

      case 17:
        attendance = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).json({
          message: 'Clock-out successful',
          attendance: attendance,
          isClockedIn: false,
          clockOutTime: attendance.checkout_Time
        }));

      case 21:
        context$1$0.prev = 21;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error clocking out:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 21]]);
};

var getAttendance = function getAttendance(req, res) {
  var email, findEmployee, attendanceData;
  return regeneratorRuntime.async(function getAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        email = req.params.email;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: {
            companyEmail: email
          }
        }));

      case 4:
        findEmployee = context$1$0.sent;

        if (findEmployee) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Employee not found'));

      case 7:
        context$1$0.next = 9;
        return regeneratorRuntime.awrap(prisma.attendance.findMany({
          where: {
            companyEmail: email
          }
        }));

      case 9:
        attendanceData = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).json(attendanceData));

      case 13:
        context$1$0.prev = 13;
        context$1$0.t0 = context$1$0['catch'](1);

        console.error('Error fetching attendance data:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Server error'));

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[1, 13]]);
};

var getAllAttendance = function getAllAttendance(req, res) {
  var _req$params, employeeId, year, month, week, isEmployee, dateFilter, hasDateFilter, firstDayOfYear, firstDayOfWeek, attendanceByEmployeeId;

  return regeneratorRuntime.async(function getAllAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$params = req.params;
        employeeId = _req$params.employeeId;
        year = _req$params.year;
        month = _req$params.month;
        week = _req$params.week;
        context$1$0.prev = 5;
        context$1$0.next = 8;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: {
            employee_id: employeeId
          }
        }));

      case 8:
        isEmployee = context$1$0.sent;

        if (isEmployee) {
          context$1$0.next = 11;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Employee data not found'));

      case 11:
        dateFilter = {};
        hasDateFilter = false;

        if (year && !isNaN(year)) {
          dateFilter.gte = new Date(year, 0, 1);
          dateFilter.lt = new Date(parseInt(year) + 1, 0, 1);
          hasDateFilter = true;
        }
        if (month && !isNaN(month)) {
          dateFilter.gte = new Date(year, month - 1, 1);
          dateFilter.lt = new Date(year, month, 1);
          hasDateFilter = true;
        }
        if (week && !isNaN(week)) {
          firstDayOfYear = new Date(year, 0, 1);
          firstDayOfWeek = new Date(firstDayOfYear);

          firstDayOfWeek.setDate(firstDayOfYear.getDate() + (week - 1) * 7 - firstDayOfYear.getDay() + 1); // Ensure the week starts from Sunday
          dateFilter.gte = firstDayOfWeek;
          dateFilter.lt = new Date(firstDayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          hasDateFilter = true;
        }

        context$1$0.next = 18;
        return regeneratorRuntime.awrap(prisma.attendance.findMany({
          where: _extends({
            employeeId: employeeId
          }, hasDateFilter && { date: dateFilter }),
          orderBy: {
            date: 'asc'
          }
        }));

      case 18:
        attendanceByEmployeeId = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(attendanceByEmployeeId));

      case 22:
        context$1$0.prev = 22;
        context$1$0.t0 = context$1$0['catch'](5);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[5, 22]]);
};

var approveAttendance = function approveAttendance(req, res) {
  var _req$body2, employeeId, year, month, user, dateFilter, updatedAttendance;

  return regeneratorRuntime.async(function approveAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body2 = req.body;
        employeeId = _req$body2.employeeId;
        year = _req$body2.year;
        month = _req$body2.month;
        context$1$0.prev = 4;

        if (!(!year || !month)) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'Invalid parameters. Please provide year and month.' }));

      case 7:
        context$1$0.next = 9;
        return regeneratorRuntime.awrap(prisma.user.findUnique({
          where: { employeeId: employeeId }
        }));

      case 9:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 12;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found.' }));

      case 12:
        if (!(user.role !== 'Manager' && user.role !== 'Admin')) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' }));

      case 14:
        dateFilter = {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        };
        context$1$0.next = 17;
        return regeneratorRuntime.awrap(prisma.attendance.updateMany({
          where: {
            employeeId: employeeId,
            date: dateFilter
          },
          data: { status: 'approved' }
        }));

      case 17:
        updatedAttendance = context$1$0.sent;

        console.log('Attendance approval successful:', updatedAttendance);
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Attendance approved', updatedAttendance: updatedAttendance }));

      case 22:
        context$1$0.prev = 22;
        context$1$0.t0 = context$1$0['catch'](4);

        console.error('Error approving attendance:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 22]]);
};

var getAverageWorkingTime = function getAverageWorkingTime(req, res) {
  var employeeId, attendanceRecords, totalDuration, totalCheckinTime, totalCheckoutTime, averageDuration, averageCheckinTime, averageCheckoutTime, averageCheckinHours, averageCheckinMinutes, averageCheckin, averageCheckoutHours, averageCheckoutMinutes, averageCheckout;
  return regeneratorRuntime.async(function getAverageWorkingTime$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        employeeId = req.params.employeeId;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return regeneratorRuntime.awrap(prisma.attendance.findMany({
          where: { employeeId: employeeId, checkout_Time: { not: null } }
        }));

      case 4:
        attendanceRecords = context$1$0.sent;

        if (attendanceRecords.length) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('No attendance records found for this employee'));

      case 7:
        totalDuration = 0;
        totalCheckinTime = 0;
        totalCheckoutTime = 0;

        attendanceRecords.forEach(function (record) {
          var checkinTime = new Date(record.checkin_Time);
          var checkoutTime = new Date(record.checkout_Time);

          var duration = (checkoutTime - checkinTime) / (1000 * 60 * 60); // convert milliseconds to hours
          totalDuration += duration;

          // Add the time part of the checkin and checkout times
          totalCheckinTime += checkinTime.getHours() * 60 + checkinTime.getMinutes();
          totalCheckoutTime += checkoutTime.getHours() * 60 + checkoutTime.getMinutes();
        });

        averageDuration = totalDuration / attendanceRecords.length;
        averageCheckinTime = totalCheckinTime / attendanceRecords.length;
        averageCheckoutTime = totalCheckoutTime / attendanceRecords.length;
        averageCheckinHours = Math.floor(averageCheckinTime / 60);
        averageCheckinMinutes = Math.floor(averageCheckinTime % 60);
        averageCheckin = String(averageCheckinHours).padStart(2, '0') + ':' + String(averageCheckinMinutes).padStart(2, '0');
        averageCheckoutHours = Math.floor(averageCheckoutTime / 60);
        averageCheckoutMinutes = Math.floor(averageCheckoutTime % 60);
        averageCheckout = String(averageCheckoutHours).padStart(2, '0') + ':' + String(averageCheckoutMinutes).padStart(2, '0');
        return context$1$0.abrupt('return', res.status(200).json({
          averageCheckinTime: averageCheckin,
          averageCheckoutTime: averageCheckout,
          averageWorkingTime: averageDuration.toFixed(2)
        }));

      case 23:
        context$1$0.prev = 23;
        context$1$0.t0 = context$1$0['catch'](1);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[1, 23]]);
};

var singleUserAttendance = function singleUserAttendance(req, res) {
  var employeeId, isEmployee, employeeAttendance;
  return regeneratorRuntime.async(function singleUserAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        employeeId = req.params.employeeId;

        console.log('Fetching attendance for employee ID: ' + employeeId); // Add logging

        context$1$0.prev = 2;
        context$1$0.next = 5;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: {
            employee_id: employeeId
          }
        }));

      case 5:
        isEmployee = context$1$0.sent;

        if (isEmployee) {
          context$1$0.next = 9;
          break;
        }

        console.log('Employee with ID: ' + employeeId + ' not found'); // Add logging
        return context$1$0.abrupt('return', res.status(400).send('Employee data not found'));

      case 9:
        context$1$0.next = 11;
        return regeneratorRuntime.awrap(prisma.attendance.findMany({
          where: {
            employeeId: employeeId
          }
        }));

      case 11:
        employeeAttendance = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(employeeAttendance));

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](2);

        console.error('Error fetching employee attendance:', context$1$0.t0); // Add logging
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 19:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[2, 15]]);
};

var approveSingleAttendance = function approveSingleAttendance(req, res) {
  var _req$body3, employeeId, adminEmail, year, month, selectedIds, user, updatedAttendance;

  return regeneratorRuntime.async(function approveSingleAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body3 = req.body;
        employeeId = _req$body3.employeeId;
        adminEmail = _req$body3.adminEmail;
        year = _req$body3.year;
        month = _req$body3.month;
        selectedIds = _req$body3.selectedIds;
        context$1$0.prev = 6;

        if (!(!year || !month || !selectedIds)) {
          context$1$0.next = 9;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'Invalid parameters. Please provide year, month, and selectedIds.' }));

      case 9:
        context$1$0.next = 11;
        return regeneratorRuntime.awrap(prisma.user.findUnique({
          where: { email: adminEmail }
        }));

      case 11:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found.' }));

      case 14:
        if (!(user.role !== 'Manager' && user.role !== 'Admin')) {
          context$1$0.next = 16;
          break;
        }

        return context$1$0.abrupt('return', res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' }));

      case 16:
        context$1$0.next = 18;
        return regeneratorRuntime.awrap(prisma.attendance.updateMany({
          where: {
            id: { 'in': selectedIds }
          },
          data: { status: 'approved' }
        }));

      case 18:
        updatedAttendance = context$1$0.sent;

        console.log('Attendance approval successful:', updatedAttendance);
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Attendance approved', updatedAttendance: updatedAttendance }));

      case 23:
        context$1$0.prev = 23;
        context$1$0.t0 = context$1$0['catch'](6);

        console.error('Error approving attendance:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[6, 23]]);
};

var declineSingleAttendance = function declineSingleAttendance(req, res) {
  var _req$body4, employeeId, adminEmail, year, month, selectedIds, user, updatedAttendance;

  return regeneratorRuntime.async(function declineSingleAttendance$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body4 = req.body;
        employeeId = _req$body4.employeeId;
        adminEmail = _req$body4.adminEmail;
        year = _req$body4.year;
        month = _req$body4.month;
        selectedIds = _req$body4.selectedIds;
        context$1$0.prev = 6;

        if (!(!year || !month || !selectedIds)) {
          context$1$0.next = 9;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'Invalid parameters. Please provide year, month, and selectedIds.' }));

      case 9:
        context$1$0.next = 11;
        return regeneratorRuntime.awrap(prisma.user.findUnique({
          where: { email: adminEmail }
        }));

      case 11:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).json({ message: 'User not found.' }));

      case 14:
        if (!(user.role !== 'Manager' && user.role !== 'Admin')) {
          context$1$0.next = 16;
          break;
        }

        return context$1$0.abrupt('return', res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' }));

      case 16:
        context$1$0.next = 18;
        return regeneratorRuntime.awrap(prisma.attendance.updateMany({
          where: {
            id: { 'in': selectedIds }
          },
          data: { status: 'declined' }
        }));

      case 18:
        updatedAttendance = context$1$0.sent;

        console.log('Attendance declination successful:', updatedAttendance);
        return context$1$0.abrupt('return', res.status(200).json({ message: 'Attendance declined', updatedAttendance: updatedAttendance }));

      case 23:
        context$1$0.prev = 23;
        context$1$0.t0 = context$1$0['catch'](6);

        console.error('Error declining attendance:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[6, 23]]);
};

// Add a new endpoint to check clock-in status
var getClockStatus = function getClockStatus(req, res) {
  var email, today, attendance;
  return regeneratorRuntime.async(function getClockStatus$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        email = req.params.email;
        today = new Date();

        today.setHours(0, 0, 0, 0);

        context$1$0.next = 6;
        return regeneratorRuntime.awrap(prisma.attendance.findFirst({
          where: {
            companyEmail: email,
            date: {
              gte: today
            }
          },
          orderBy: {
            checkin_Time: 'desc'
          }
        }));

      case 6:
        attendance = context$1$0.sent;

        if (attendance) {
          context$1$0.next = 9;
          break;
        }

        return context$1$0.abrupt('return', res.status(200).json({
          isClockedIn: false,
          clockInTime: null,
          clockOutTime: null
        }));

      case 9:
        return context$1$0.abrupt('return', res.status(200).json({
          isClockedIn: !attendance.checkout_Time,
          clockInTime: attendance.checkin_Time,
          clockOutTime: attendance.checkout_Time
        }));

      case 12:
        context$1$0.prev = 12;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error getting clock status:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).json({ error: context$1$0.t0.message }));

      case 16:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 12]]);
};

// Add endpoint to get daily clock status
var getDailyClockStatus = function getDailyClockStatus(req, res) {
  var email, today, attendance;
  return regeneratorRuntime.async(function getDailyClockStatus$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        email = req.params.email;
        today = new Date();

        today.setHours(0, 0, 0, 0);

        context$1$0.next = 6;
        return regeneratorRuntime.awrap(prisma.attendance.findFirst({
          where: {
            companyEmail: email,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }));

      case 6:
        attendance = context$1$0.sent;

        res.json({
          hasClockedInToday: attendance ? !!attendance.checkin_Time : false,
          hasClockedOutToday: attendance ? !!attendance.checkout_Time : false,
          clockInTime: attendance && attendance.checkin_Time ? attendance.checkin_Time : null,
          clockOutTime: attendance && attendance.checkout_Time ? attendance.checkout_Time : null,
          hasSubmittedReport: attendance ? !!attendance.reports : false
        });
        context$1$0.next = 14;
        break;

      case 10:
        context$1$0.prev = 10;
        context$1$0.t0 = context$1$0['catch'](0);

        console.error('Error checking daily clock status:', context$1$0.t0);
        res.status(500).json({ message: 'Error checking daily clock status' });

      case 14:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 10]]);
};

var getTodaysAttendance = function getTodaysAttendance(req, res) {
  var _ret;

  return regeneratorRuntime.async(function getTodaysAttendance$(context$1$0) {
    var _this2 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return regeneratorRuntime.awrap((function callee$1$0() {
          var today, tomorrow, employees, attendanceRecords, todaysAttendance;
          return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                console.log('Starting getTodaysAttendance...');

                today = new Date();

                today.setHours(0, 0, 0, 0);

                tomorrow = new Date(today);

                tomorrow.setDate(tomorrow.getDate() + 1);

                console.log('Fetching employees...');
                context$2$0.next = 8;
                return regeneratorRuntime.awrap(prisma.employee.findMany({
                  select: {
                    employee_id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    department: true,
                    employeeImg: true
                  }
                }));

              case 8:
                employees = context$2$0.sent;

                console.log('Found ' + employees.length + ' employees');

                context$2$0.next = 12;
                return regeneratorRuntime.awrap(prisma.attendance.findMany({
                  where: {
                    date: {
                      gte: today,
                      lt: tomorrow
                    }
                  }
                }));

              case 12:
                attendanceRecords = context$2$0.sent;

                console.log('Found ' + attendanceRecords.length + ' attendance records');

                todaysAttendance = employees.map(function (employee) {
                  var attendance = attendanceRecords.find(function (record) {
                    return record.employeeId === employee.employee_id;
                  });

                  return {
                    employeeId: employee.employee_id,
                    employeeName: (employee.firstname + ' ' + employee.lastname).trim(),
                    email: employee.email,
                    department: employee.department || 'N/A',
                    profileImage: employee.employeeImg,
                    checkin_Time: attendance ? attendance.checkin_Time : null,
                    checkout_Time: attendance ? attendance.checkout_Time : null,
                    status: attendance ? attendance.status : 'absent',
                    date: today
                  };
                });

                console.log('Successfully processed attendance data');
                return context$2$0.abrupt('return', {
                  v: res.status(200).json(todaysAttendance)
                });

              case 17:
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

        console.error('Detailed error in getTodaysAttendance:', {
          message: context$1$0.t0.message,
          stack: context$1$0.t0.stack,
          name: context$1$0.t0.name
        });

        return context$1$0.abrupt('return', res.status(500).json({
          error: 'Internal Server Error',
          details: context$1$0.t0.message,
          stack: process.env.NODE_ENV === 'development' ? context$1$0.t0.stack : undefined
        }));

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 8]]);
};

module.exports = {
  clockIn: clockIn,
  clockOut: clockOut,
  employeeReport: employeeReport,
  getAttendance: getAttendance,
  getAllAttendance: getAllAttendance,
  getAverageWorkingTime: getAverageWorkingTime,
  singleUserAttendance: singleUserAttendance,
  approveSingleAttendance: approveSingleAttendance,
  declineSingleAttendance: declineSingleAttendance,
  getClockStatus: getClockStatus,
  getDailyClockStatus: getDailyClockStatus,
  getTodaysAttendance: getTodaysAttendance
};

// Check if user has already clocked in today

// Create new attendance record

// Extract media URLs from the rich content if needed
// Implement this helper function

// Find today's active attendance record

// Update the attendance record with checkout time

// Fetch user from the user table

// Check if the user role is Manager or Admin

// Convert average check-in and check-out times from minutes to HH:MM format