'use strict';

var _this = this;

var _require = require('@prisma/client');

var PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var createTeam = function createTeam(req, res) {
  var _req$body, userEmail, teamName, description, departmentName, isAuthorized, newTeam;

  return regeneratorRuntime.async(function createTeam$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body = req.body;
        userEmail = _req$body.userEmail;
        teamName = _req$body.teamName;
        description = _req$body.description;
        departmentName = _req$body.departmentName;
        context$1$0.prev = 5;
        context$1$0.next = 8;
        return regeneratorRuntime.awrap(prisma.user.findFirst({
          where: {
            email: userEmail
          }
        }));

      case 8:
        isAuthorized = context$1$0.sent;

        if (!(!isAuthorized || isAuthorized.role !== 'Manager' && isAuthorized.role !== 'Admin')) {
          context$1$0.next = 11;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Only admin and manager can create a team'));

      case 11:
        context$1$0.next = 13;
        return regeneratorRuntime.awrap(prisma.team.create({
          data: {
            teamName: teamName,
            description: description,
            departmentName: departmentName
          }
        }));

      case 13:
        newTeam = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(newTeam));

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](5);

        console.error('Error creating team:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 21:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[5, 17]]);
};
var addEmployeeToTeam = function addEmployeeToTeam(req, res) {
  var _req$body2, employeeEmail, teamName, employee, updatedEmployee;

  return regeneratorRuntime.async(function addEmployeeToTeam$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body2 = req.body;
        employeeEmail = _req$body2.employeeEmail;
        teamName = _req$body2.teamName;
        context$1$0.prev = 3;
        context$1$0.next = 6;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: { companyEmail: employeeEmail }
        }));

      case 6:
        employee = context$1$0.sent;

        if (employee) {
          context$1$0.next = 9;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Employee not found'));

      case 9:
        context$1$0.next = 11;
        return regeneratorRuntime.awrap(prisma.employee.update({
          where: { employee_id: employee.employee_id }, // Use employee_id as the unique identifier
          data: { teamName: teamName }
        }));

      case 11:
        updatedEmployee = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(updatedEmployee));

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](3);

        console.error('Error adding employee to team:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 19:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 15]]);
};

var appointTeamLead = function appointTeamLead(req, res) {
  var _req$body3, employeeEmail, teamName, employee, team;

  return regeneratorRuntime.async(function appointTeamLead$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _req$body3 = req.body;
        employeeEmail = _req$body3.employeeEmail;
        teamName = _req$body3.teamName;
        context$1$0.prev = 3;
        context$1$0.next = 6;
        return regeneratorRuntime.awrap(prisma.employee.findFirst({
          where: { companyEmail: employeeEmail }
        }));

      case 6:
        employee = context$1$0.sent;
        context$1$0.next = 9;
        return regeneratorRuntime.awrap(prisma.team.findFirst({
          where: { teamName: teamName }
        }));

      case 9:
        team = context$1$0.sent;

        if (employee) {
          context$1$0.next = 12;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Employee not found'));

      case 12:
        if (team) {
          context$1$0.next = 14;
          break;
        }

        return context$1$0.abrupt('return', res.status(400).send('Team not found'));

      case 14:
        context$1$0.next = 16;
        return regeneratorRuntime.awrap(prisma.employee.updateMany({
          where: {
            teamName: teamName
          },
          data: {
            reportingManager: employee.firstname,
            reportingManagerId: employee.employee_id
          }
        }));

      case 16:
        context$1$0.next = 18;
        return regeneratorRuntime.awrap(prisma.team.update({
          where: {
            teamName: teamName,
            id: team.id
          },
          data: {
            teamLeadId: employee.employee_id,
            teamLeadName: employee.firstname
          }
        }));

      case 18:
        return context$1$0.abrupt('return', res.status(200).send('Team lead appointed successfully'));

      case 21:
        context$1$0.prev = 21;
        context$1$0.t0 = context$1$0['catch'](3);

        console.error('Error appointing team lead:', context$1$0.t0);
        return context$1$0.abrupt('return', res.status(500).send('Internal server error: ' + context$1$0.t0.message));

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 21]]);
};
var getAllTeams = function getAllTeams(req, res) {
  var allTeams;
  return regeneratorRuntime.async(function getAllTeams$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        context$1$0.next = 3;
        return regeneratorRuntime.awrap(prisma.team.findMany({}));

      case 3:
        allTeams = context$1$0.sent;
        return context$1$0.abrupt('return', res.status(200).send(allTeams));

      case 7:
        context$1$0.prev = 7;
        context$1$0.t0 = context$1$0['catch'](0);
        return context$1$0.abrupt('return', req.status(500).send('internal error' + context$1$0.t0.message));

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 7]]);
};
module.exports = { createTeam: createTeam, addEmployeeToTeam: addEmployeeToTeam, appointTeamLead: appointTeamLead, getAllTeams: getAllTeams };

// Find the employee by email

// Update the employee's team

// Update all employees in the team with the new team lead

// Update the team with the new team lead