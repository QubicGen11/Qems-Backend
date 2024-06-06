const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const clockIn = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`ClockIn request received with email: ${email}`);

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            console.log('User not found.');
            return res.status(400).json({ message: 'User not found. Please login or register as a user.' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: user.employeeId,
                checkin_Time: new Date(),
                companyEmail: email,
                status:'pending'
            }
        });

        console.log('Clock-in successful:', attendance);
        return res.status(200).json({ message: 'Clock-in successful', attendance });
    } catch (error) {
        console.error('Error clocking in:', error);
        return res.status(500).json({ error: error.message });
    }
};

const clockOut = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`ClockOut request received with email: ${email}`);

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            console.log('User not found.');
            return res.status(400).json({ message: 'User not found. Please login or register as a user.' });
        }

        const latestAttendance = await prisma.attendance.findFirst({
            where: {
                companyEmail: email,
                checkout_Time: null // Find the latest record with no checkout time
            },
            orderBy: {
                checkin_Time: 'desc'
            }
        });

        if (!latestAttendance) {
            console.log('No active clock-in record found for this user.');
            return res.status(400).json({ message: 'No active clock-in record found for this user.' });
        }

        const attendance = await prisma.attendance.update({
            where: {
                id: latestAttendance.id
            },
            data: {
                checkout_Time: new Date()
            }
        });

        console.log('Clock-out successful:', attendance);
        return res.status(200).json({ message: 'Clock-out successful', attendance });
    } catch (error) {
        console.error('Error clocking out:', error);
        return res.status(500).json({ error: error.message });
    }
};
const getAttendance = async (req, res) => {
    const { email } = req.params;
    try {
      const findEmployee = await prisma.employee.findFirst({
        where: {
          companyEmail: email,
        },
      });
  
      if (!findEmployee) {
        return res.status(400).send('Employee is not there');
      }
  
      const attendanceData = await prisma.attendance.findMany({
        where: {
          companyEmail: email,
        },
      });
  
      return res.status(200).json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return res.status(500).send('Server error');
    }
  };
  
module.exports = { clockIn, clockOut,getAttendance };
