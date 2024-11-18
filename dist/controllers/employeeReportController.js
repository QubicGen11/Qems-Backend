'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var createReport = function createReport(req, res) {
  var _req$body, email, reportText, existingEmployee, newReport;

  return regeneratorRuntime.async(function createReport$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body = req.body;
        email = _req$body.email;
        reportText = _req$body.reportText;
        context$1$0.prev = 3;

        if (!(!email || !reportText)) {
          context$1$0.next = 6;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Email and report text are required.'));

      case 6:
        context$1$0.next = 8;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: { companyEmail: email }
        }));

      case 8:
        existingEmployee = context$1$0.sent;

        if (existingEmployee) {
          context$1$0.next = 11;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Employee not found.'));

      case 11:
        context$1$0.next = 13;
        return regeneratorRuntime.awrap(prisma.attendance.update({
          data: {
            companyEmail: email,
            employeeId: existingEmployee.employee_id,
            report: reportText
          }
        }));

      case 13:
        newReport = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(201).json(newReport));

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](3);

        console.error('Error creating report:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error'));

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 17]]);
};

var fetchReports = function fetchReports(req, res) {
  var email, existingReports;
  return regeneratorRuntime.async(function fetchReports$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        email = req.params.email;
        context$1$0.prev = 1;
        context$1$0.next = 4;
        return regeneratorRuntime.awrap(prisma.employeeReports.findMany({
          where: {
            employeeEmail: {
              equals: email }
          }
        }));

      case 4:
        existingReports = context$1$0.sent;

        if (existingReports.length) {
          context$1$0.next = 7;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('No reports found'));

      case 7:
        return context$1$0.abrupt('return', res.status(200).json(existingReports));

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

module.exports = { createReport: createReport, fetchReports: fetchReports };
// add other necessary fields here
// Destructure email from req.params
// Use the equals operator to compare the email