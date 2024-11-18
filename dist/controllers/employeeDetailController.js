'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();
var path = require('path');

var generateEmployeeId = function generateEmployeeId() {
    var prefix, lastEmployee, newIdNumber, lastIdNumber;
    return regeneratorRuntime.async(function generateEmployeeId$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                prefix = 'QG24';
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    orderBy: { employee_id: 'desc' }
                }));

            case 3:
                lastEmployee = context$1$0.sent;
                newIdNumber = undefined;

                if (lastEmployee) {
                    lastIdNumber = parseInt(lastEmployee.employee_id.slice(prefix.length));

                    newIdNumber = lastIdNumber + 1;
                } else {
                    newIdNumber = 1;
                }
                return context$1$0.abrupt('return', '' + prefix + newIdNumber.toString().padStart(3, '0'));

            case 7:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this);
};

var createEmployee = function createEmployee(req, res) {
    var _req$body, firstname, lastname, dob, gender, address, phone, position, email, department, linkedin, education, skills, about, companyEmail, employeeImg, employeeId, dobDate, employee;

    return regeneratorRuntime.async(function createEmployee$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body = req.body;
                firstname = _req$body.firstname;
                lastname = _req$body.lastname;
                dob = _req$body.dob;
                gender = _req$body.gender;
                address = _req$body.address;
                phone = _req$body.phone;
                position = _req$body.position;
                email = _req$body.email;
                department = _req$body.department;
                linkedin = _req$body.linkedin;
                education = _req$body.education;
                skills = _req$body.skills;
                about = _req$body.about;
                companyEmail = _req$body.companyEmail;
                employeeImg = _req$body.employeeImg;
                context$1$0.prev = 16;
                context$1$0.next = 19;
                return regeneratorRuntime.awrap(generateEmployeeId());

            case 19:
                employeeId = context$1$0.sent;
                dobDate = dob ? new Date(dob) : null;

                if (!(dobDate && isNaN(dobDate.getTime()))) {
                    context$1$0.next = 23;
                    break;
                }

                throw new Error('Invalid date format for dob');

            case 23:
                context$1$0.next = 25;
                return regeneratorRuntime.awrap(prisma.employee.create({
                    data: {
                        employee_id: employeeId,
                        firstname: firstname || null,
                        lastname: lastname || null,
                        dob: dobDate,
                        gender: gender || null,
                        address: address || null,
                        phone: phone || null,
                        email: email,
                        department: department,
                        position: position,
                        education: education,
                        skills: skills,
                        linkedin: linkedin || null,
                        about: about || null,
                        companyEmail: companyEmail,
                        employeeImg: employeeImg || null,
                        hireDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }));

            case 25:
                employee = context$1$0.sent;

                if (!companyEmail) {
                    context$1$0.next = 29;
                    break;
                }

                context$1$0.next = 29;
                return regeneratorRuntime.awrap(prisma.user.update({
                    where: {
                        email: companyEmail
                    },
                    data: {
                        employeeId: employeeId
                    }
                }));

            case 29:

                res.status(201).json(employee);
                context$1$0.next = 36;
                break;

            case 32:
                context$1$0.prev = 32;
                context$1$0.t0 = context$1$0['catch'](16);

                console.error('Error creating employee:', context$1$0.t0);
                res.status(500).json({ error: 'Internal server error' });

            case 36:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[16, 32]]);
};

var getEmployeeById = function getEmployeeById(req, res) {
    var id, employee;
    return regeneratorRuntime.async(function getEmployeeById$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                id = req.params.id;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.employee.findUnique({
                    where: { employee_id: id },
                    include: {
                        users: true }
                }));

            case 4:
                employee = context$1$0.sent;
                // Include related User model

                if (employee) {
                    res.status(200).json(employee);
                } else {
                    res.status(404).json({ error: 'Employee not found' });
                }
                context$1$0.next = 12;
                break;

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0['catch'](1);

                console.error('Error fetching employee:', context$1$0.t0);
                res.status(500).json({ error: 'Internal server error' });

            case 12:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 8]]);
};

var updateEmployee = function updateEmployee(req, res) {
    var id, _req$body2, firstname, lastname, dob, gender, address, phone, position, email, linkedin, about, education, skills, employeeImg, existingEmployee, dobDate, employeeData, employee;

    return regeneratorRuntime.async(function updateEmployee$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                id = req.params.id;
                _req$body2 = req.body;
                firstname = _req$body2.firstname;
                lastname = _req$body2.lastname;
                dob = _req$body2.dob;
                gender = _req$body2.gender;
                address = _req$body2.address;
                phone = _req$body2.phone;
                position = _req$body2.position;
                email = _req$body2.email;
                linkedin = _req$body2.linkedin;
                about = _req$body2.about;
                education = _req$body2.education;
                skills = _req$body2.skills;
                employeeImg = _req$body2.employeeImg;
                context$1$0.prev = 15;

                console.log('Update request received for employee ID:', id);
                console.log('Data received:', req.body);

                context$1$0.next = 20;
                return regeneratorRuntime.awrap(prisma.employee.findUnique({
                    where: { employee_id: id }
                }));

            case 20:
                existingEmployee = context$1$0.sent;

                if (existingEmployee) {
                    context$1$0.next = 23;
                    break;
                }

                return context$1$0.abrupt('return', res.status(404).json({ error: 'Employee not found' }));

            case 23:
                dobDate = dob ? new Date(dob) : null;

                if (!(dobDate && isNaN(dobDate.getTime()))) {
                    context$1$0.next = 26;
                    break;
                }

                throw new Error('Invalid date format for dob');

            case 26:
                employeeData = {
                    firstname: firstname || null,
                    lastname: lastname || null,
                    dob: dobDate,
                    gender: gender || null,
                    address: address || null,
                    phone: phone || null,
                    email: email,
                    position: position,
                    linkedin: linkedin || null,
                    about: about || null,
                    education: education || null,
                    skills: skills || null,
                    updatedAt: new Date(),
                    employeeImg: employeeImg || null
                };
                context$1$0.next = 29;
                return regeneratorRuntime.awrap(prisma.employee.update({
                    where: { employee_id: id },
                    data: employeeData
                }));

            case 29:
                employee = context$1$0.sent;

                console.log('Updated employee:', employee);
                res.status(200).json(employee);
                context$1$0.next = 38;
                break;

            case 34:
                context$1$0.prev = 34;
                context$1$0.t0 = context$1$0['catch'](15);

                console.error('Error updating employee:', context$1$0.t0);
                res.status(500).json({ error: 'Internal server error' });

            case 38:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[15, 34]]);
};

var deleteEmployee = function deleteEmployee(req, res) {
    var employeeId;
    return regeneratorRuntime.async(function deleteEmployee$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employeeId = req.params.employeeId;

                console.log('Employee ID:', employeeId);
                context$1$0.prev = 2;

                if (employeeId) {
                    context$1$0.next = 5;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('Employee ID is required'));

            case 5:
                context$1$0.next = 7;
                return regeneratorRuntime.awrap(prisma.attendance.deleteMany({
                    where: {
                        employee: {
                            employee_id: employeeId
                        }
                    }
                }));

            case 7:
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(prisma.salary.deleteMany({
                    where: {
                        employee_id: employeeId // Using employee_id as per schema
                    }
                }));

            case 9:
                context$1$0.next = 11;
                return regeneratorRuntime.awrap(prisma.employee['delete']({
                    where: {
                        employee_id: employeeId
                    }
                }));

            case 11:

                res.status(204).send();
                context$1$0.next = 18;
                break;

            case 14:
                context$1$0.prev = 14;
                context$1$0.t0 = context$1$0['catch'](2);

                console.error('Error deleting employee:', context$1$0.t0);
                res.status(500).json({
                    error: 'Internal server error',
                    details: context$1$0.t0.message,
                    stack: process.env.NODE_ENV === 'development' ? context$1$0.t0.stack : undefined
                });

            case 18:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[2, 14]]);
};

var getAllEmployees = function getAllEmployees(req, res) {
    var employees;
    return regeneratorRuntime.async(function getAllEmployees$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(prisma.employee.findMany({
                    include: { users: true } }));

            case 3:
                employees = context$1$0.sent;
                // Include related User model

                res.status(200).json(employees);
                context$1$0.next = 11;
                break;

            case 7:
                context$1$0.prev = 7;
                context$1$0.t0 = context$1$0['catch'](0);

                console.error('Error fetching employees:', context$1$0.t0);
                res.status(500).json({ error: 'Internal server error' });

            case 11:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[0, 7]]);
};

var fetchEmployeeDetails = function fetchEmployeeDetails(req, res) {
    var _req$params, email, employeeId, getData, getDataById;

    return regeneratorRuntime.async(function fetchEmployeeDetails$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$params = req.params;
                email = _req$params.email;
                employeeId = _req$params.employeeId;
                context$1$0.prev = 3;
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    where: { companyEmail: email },
                    include: {
                        users: true
                    }
                }));

            case 6:
                getData = context$1$0.sent;
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    where: {
                        employee_id: employeeId
                    }
                }));

            case 9:
                getDataById = context$1$0.sent;

                if (!(!getData || !getDataById)) {
                    context$1$0.next = 12;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('Employee data is not available'));

            case 12:
                return context$1$0.abrupt('return', res.status(200).json(getData));

            case 16:
                context$1$0.prev = 16;
                context$1$0.t0 = context$1$0['catch'](3);

                console.error('Internal server error:', context$1$0.t0);
                return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

            case 20:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[3, 16]]);
};

var fetchEmployeeDataById = function fetchEmployeeDataById(req, res) {
    var employeeId, getEmployeeData;
    return regeneratorRuntime.async(function fetchEmployeeDataById$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                employeeId = req.params.employeeId;
                context$1$0.prev = 1;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(prisma.employee.findFirst({
                    where: {
                        employee_id: employeeId
                    }
                }));

            case 4:
                getEmployeeData = context$1$0.sent;

                if (getEmployeeData) {
                    context$1$0.next = 7;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('employee data not found'));

            case 7:
                return context$1$0.abrupt('return', res.status(200).json(getEmployeeData));

            case 10:
                context$1$0.prev = 10;
                context$1$0.t0 = context$1$0['catch'](1);
                return context$1$0.abrupt('return', res.status(500).send('Internal error' + context$1$0.t0.message));

            case 13:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[1, 10]]);
};

var uploadEmployeeFile = function uploadEmployeeFile(req, res) {
    var _req$body3, email, employeeImg, existingEmployee, updatedEmployee;

    return regeneratorRuntime.async(function uploadEmployeeFile$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                _req$body3 = req.body;
                email = _req$body3.email;
                employeeImg = _req$body3.employeeImg;

                if (!(!email || !employeeImg)) {
                    context$1$0.next = 5;
                    break;
                }

                return context$1$0.abrupt('return', res.status(400).send('Email and image are required.'));

            case 5:
                context$1$0.prev = 5;
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
                return regeneratorRuntime.awrap(prisma.employee.update({
                    where: { employee_id: existingEmployee.employee_id },
                    data: {
                        employeeImg: employeeImg
                    }
                }));

            case 13:
                updatedEmployee = context$1$0.sent;

                res.status(200).json({ message: 'File uploaded successfully', updatedEmployee: updatedEmployee });
                context$1$0.next = 21;
                break;

            case 17:
                context$1$0.prev = 17;
                context$1$0.t0 = context$1$0['catch'](5);

                console.error('Error uploading file:', context$1$0.t0);
                res.status(500).send('Internal server error');

            case 21:
            case 'end':
                return context$1$0.stop();
        }
    }, null, _this, [[5, 17]]);
};

module.exports = { createEmployee: createEmployee, getEmployeeById: getEmployeeById, getAllEmployees: getAllEmployees, updateEmployee: updateEmployee, deleteEmployee: deleteEmployee, fetchEmployeeDetails: fetchEmployeeDetails, fetchEmployeeDataById: fetchEmployeeDataById, uploadEmployeeFile: uploadEmployeeFile };

// Verify that the dob is a valid date

// Verify that the dob is a valid date

// Delete related attendance records

// Delete related salary records (if any)

// Delete the employee record
// Return the data directly