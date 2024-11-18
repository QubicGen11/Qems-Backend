'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var getDocument = function getDocument(req, res) {
    var _req$params, type, employeeId, employee, user, template, data;

    return regeneratorRuntime.async(function getDocument$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$params = req.params;
                type = _req$params.type;
                employeeId = _req$params.employeeId;
                context$1$0.prev = 3;
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(prisma.employee.findUnique({
                    where: { employee_id: employeeId },
                    include: {
                        users: true }
                }));

            case 6:
                employee = context$1$0.sent;

                if (employee) {
                    context$1$0.next = 9;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).send('Employee not found'));

            case 9:
                user = employee.users && employee.users[0];

                if (user) {
                    context$1$0.next = 12;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).send('User not found'));

            case 12:
                template = undefined;
                context$1$0.t0 = type;
                context$1$0.next = context$1$0.t0 === 'offer' ? 16 : context$1$0.t0 === 'joining' ? 18 : context$1$0.t0 === 'experience' ? 20 : context$1$0.t0 === 'hike' ? 22 : context$1$0.t0 === 'payslip' ? 24 : 26;
                break;

            case 16:
                template = 'offer_letter';
                return context$1$0.abrupt('break', 27);

            case 18:
                template = 'joining-letter';
                return context$1$0.abrupt('break', 27);

            case 20:
                template = 'experience-letter';
                return context$1$0.abrupt('break', 27);

            case 22:
                template = 'hike-letter';
                return context$1$0.abrupt('break', 27);

            case 24:
                template = 'payslips';
                return context$1$0.abrupt('break', 27);

            case 26:
                return context$1$0.abrupt('return', res.status(400).send('No documents found'));

            case 27:
                data = {
                    employee_id: employee.employee_id,
                    firstname: employee.firstname,
                    lastname: employee.lastname,
                    dob: employee.dob,
                    gender: employee.gender,
                    address: employee.address,
                    phone: employee.phone,
                    email: employee.email,
                    position: employee.position,
                    education: employee.education,
                    skills: employee.skills,
                    linkedin: employee.linkedin,
                    about: employee.about,
                    companyEmail: employee.companyEmail,
                    hireDate: employee.hireDate,
                    createdAt: employee.createdAt,
                    updatedAt: employee.updatedAt,
                    joiningDate: user.joiningDate,
                    salary: user.salary,
                    mainPosition: user.mainPosition
                };

                res.render(template, { employee: data });
                context$1$0.next = 35;
                break;

            case 31:
                context$1$0.prev = 31;
                context$1$0.t1 = context$1$0['catch'](3);

                console.error('Error fetching employee:', context$1$0.t1);
                res.status(500).send('Error fetching employee');

            case 35:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[3, 31]]);
};

module.exports = {
    getDocument: getDocument
};
// Include related User model
// Assuming a one-to-one relationship

// Combine data from both models