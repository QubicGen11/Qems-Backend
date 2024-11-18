'use strict';

var _this = this;

var getEmployeeByEmail = function getEmployeeByEmail(req, res) {
    var email, employee;
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
                        role: true
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
                return context$1$0.abrupt('return', res.status(200).json({
                    success: true,
                    data: employee
                }));

            case 10:
                context$1$0.prev = 10;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error fetching employee:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: context$1$0.t0.message
                }));

            case 14:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 10]]);
};