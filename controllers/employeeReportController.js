const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createReport = async (req, res) => {
    const { email, reportText } = req.body;
  
    try {
      if (!email || !reportText) {
        return res.status(400).send('Email and report text are required.');
      }
  
      const existingEmployee = await prisma.employee.findFirst({
        where: { companyEmail: email },
      });
  
      if (!existingEmployee) {
        return res.status(400).send('Employee not found.');
      }
  
      const newReport = await prisma.attendance.update({
        data: {
          companyEmail: email,
          employeeId:existingEmployee.employee_id,
          report: reportText,
          // add other necessary fields here
        },
      });
      return res.status(201).json(newReport);
    } catch (error) {
      console.error('Error creating report:', error);
      return res.status(500).send('Internal server error');
    }
  };
  
const fetchReports = async (req, res) => {
    const { email } = req.params; // Destructure email from req.params
    try {
      const existingReports = await prisma.employeeReports.findMany({
        where: {
          employeeEmail: {
            equals: email, // Use the equals operator to compare the email
          },
        },
      });
      if (!existingReports.length) {
        return res.status(400).send('No reports found');
      }
      return res.status(200).json(existingReports);
    } catch (error) {
      return res.status(500).send('Internal error: ' + error.message);
    }
  };
  
module.exports={createReport,fetchReports}