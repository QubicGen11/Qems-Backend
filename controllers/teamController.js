const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTeam = async (req, res) => {
  const { userEmail, teamName, description, departmentName } = req.body;
  try {
    const isAuthorized = await prisma.user.findFirst({
      where: {
        email: userEmail
      }
    });

    if (!isAuthorized || (isAuthorized.role !== 'Manager' && isAuthorized.role !== 'Admin')) {
      return res.status(400).send('Only admin and manager can create a team');
    }

    const newTeam = await prisma.team.create({
      data: {
        teamName,
        description,
        departmentName
      }
    });

    return res.status(200).send(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).send('Internal server error: ' + error.message);
  }
};
const addEmployeeToTeam = async (req, res) => {
  const { employeeEmail, teamName } = req.body;
  try {
    // Find the employee by email
    const employee = await prisma.employee.findFirst({
      where: { companyEmail: employeeEmail }
    });

    if (!employee) {
      return res.status(400).send('Employee not found');
    }

    // Update the employee's team
    const updatedEmployee = await prisma.employee.update({
      where: { employee_id: employee.employee_id }, // Use employee_id as the unique identifier
      data: { teamName: teamName }
    });

    return res.status(200).send(updatedEmployee);
  } catch (error) {
    console.error('Error adding employee to team:', error);
    return res.status(500).send('Internal server error: ' + error.message);
  }
};


const appointTeamLead = async (req, res) => {
  const { employeeEmail, teamName } = req.body;
  try {
    const employee = await prisma.employee.findFirst({
      where: { companyEmail: employeeEmail }
    });

    const team = await prisma.team.findFirst({
      where: { teamName: teamName }
    });

    if (!employee) {
      return res.status(400).send('Employee not found');
    }

    if (!team) {
      return res.status(400).send('Team not found');
    }
    // Update all employees in the team with the new team lead
    await prisma.employee.updateMany({
      where: {
        teamName: teamName
      },
      data: {
        reportingManager: employee.firstname,
        reportingManagerId: employee.employee_id
      }
    });
    // Update the team with the new team lead
    await prisma.team.update({
      where: {
        teamName: teamName,
        id:team.id
      },
      data: {
        teamLeadId: employee.employee_id,
        teamLeadName: employee.firstname
      }
    });

    return res.status(200).send('Team lead appointed successfully');
  } catch (error) {
    console.error('Error appointing team lead:', error);
    return res.status(500).send('Internal server error: ' + error.message);
  }
};
const getAllTeams=async(req,res)=>{
  try {
    const allTeams=await prisma.team.findMany({})
    return res.status(200).send(allTeams)
  } catch (error) {
    return req.status(500).send('internal error'+error.message)
  }
}
module.exports = { createTeam, addEmployeeToTeam, appointTeamLead,getAllTeams };
