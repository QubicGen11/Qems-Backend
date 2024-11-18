'use strict';

var _this = this;

var checkReportStatus = function checkReportStatus(req, res) {
  var email, today, report, employee;
  return regeneratorRuntime.async(function checkReportStatus$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        email = req.params.email;
        today = new Date();

        today.setHours(0, 0, 0, 0);

        context$1$0.next = 6;
        return regeneratorRuntime.awrap(prisma.report.findFirst({
          where: {
            employeeEmail: email,
            createdAt: {
              gte: today
            }
          }
        }));

      case 6:
        report = context$1$0.sent;

        if (report) {
          context$1$0.next = 14;
          break;
        }

        context$1$0.next = 10;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: { email: email }
        }));

      case 10:
        employee = context$1$0.sent;

        if (!employee) {
          context$1$0.next = 14;
          break;
        }

        context$1$0.next = 14;
        return regeneratorRuntime.awrap(createNotificationForEmployee(employee.employee_id, NOTIFICATION_TYPES.REPORT_PENDING));

      case 14:

        res.json({ hasSubmitted: !!report });
        context$1$0.next = 20;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](0);

        res.status(500).json({ error: 'Failed to check report status' });

      case 20:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 17]]);
};

// Create a reminder notification if report is pending