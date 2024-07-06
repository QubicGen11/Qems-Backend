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
        status: 'pending',
        employeeName: user.username,
        joinDate: user.joiningDate
      }
    });
    console.log('Clock-in successful:', attendance);
    return res.status(200).json({ message: 'Clock-in successful', attendance });
  } catch (error) {
    console.error('Error clocking in:', error);
    return res.status(500).json({ error: error.message });
  }
};

const employeeReport = async (req, res) => {
  try {
    const { email, reportText } = req.body;
    console.log(`Report submission request received with email: ${email}`);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      console.log('User not found.');
      return res.status(400).json({ message: 'User not found. Please login or register as a user.' });
    }

    const latestAttendance = await prisma.attendance.findFirst({
      where: {
        companyEmail: email,
        checkout_Time: null  
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
        reports: reportText
      }
    });

    console.log('Report submission successful:', attendance);
    return res.status(200).json({ message: 'Report submission successful', attendance });
  } catch (error) {
    console.error('Error submitting report:', error);
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
      return res.status(400).send('Employee not found');
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

const getAllAttendance = async (req, res) => {
  const { employeeId, year, month, week } = req.params;

  try {
    const isEmployee = await prisma.employee.findFirst({
      where: {
        employee_id: employeeId
      }
    });

    if (!isEmployee) {
      return res.status(400).send('Employee data not found');
    }

    const dateFilter = {};
    let hasDateFilter = false;

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
      const firstDayOfYear = new Date(year, 0, 1);
      const firstDayOfWeek = new Date(firstDayOfYear);
      firstDayOfWeek.setDate(firstDayOfYear.getDate() + (week - 1) * 7 - firstDayOfYear.getDay() + 1); // Ensure the week starts from Sunday
      dateFilter.gte = firstDayOfWeek;
      dateFilter.lt = new Date(firstDayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      hasDateFilter = true;
    }

    const attendanceByEmployeeId = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId,
        ...(hasDateFilter && { date: dateFilter })
      },
      orderBy: {
        date: 'asc'
      }
    });

    return res.status(200).send(attendanceByEmployeeId);
  } catch (error) {
    return res.status(500).send('Internal server error: ' + error.message);
  }
};

const approveAttendance = async (req, res) => {
  const { employeeId, year, month } = req.body;

  try {
    if (!year || !month) {
      return res.status(400).json({ message: 'Invalid parameters. Please provide year and month.' });
    }

    // Fetch user from the user table
    const user = await prisma.user.findUnique({
      where: { employeeId: employeeId }
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Check if the user role is Manager or Admin
    if (user.role !== 'Manager' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' });
    }

    const dateFilter = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1)
    };

    const updatedAttendance = await prisma.attendance.updateMany({
      where: {
        employeeId: employeeId,
        date: dateFilter
      },
      data: { status: 'approved' }
    });

    console.log('Attendance approval successful:', updatedAttendance);
    return res.status(200).json({ message: 'Attendance approved', updatedAttendance });
  } catch (error) {
    console.error('Error approving attendance:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getAverageWorkingTime = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { employeeId: employeeId, checkout_Time: { not: null } }
    });

    if (!attendanceRecords.length) {
      return res.status(400).send('No attendance records found for this employee');
    }

    let totalDuration = 0;
    let totalCheckinTime = 0;
    let totalCheckoutTime = 0;

    attendanceRecords.forEach(record => {
      const checkinTime = new Date(record.checkin_Time);
      const checkoutTime = new Date(record.checkout_Time);

      const duration = (checkoutTime - checkinTime) / (1000 * 60 * 60); // convert milliseconds to hours
      totalDuration += duration;

      // Add the time part of the checkin and checkout times
      totalCheckinTime += checkinTime.getHours() * 60 + checkinTime.getMinutes();
      totalCheckoutTime += checkoutTime.getHours() * 60 + checkoutTime.getMinutes();
    });

    const averageDuration = totalDuration / attendanceRecords.length;
    const averageCheckinTime = totalCheckinTime / attendanceRecords.length;
    const averageCheckoutTime = totalCheckoutTime / attendanceRecords.length;

    // Convert average check-in and check-out times from minutes to HH:MM format
    const averageCheckinHours = Math.floor(averageCheckinTime / 60);
    const averageCheckinMinutes = Math.floor(averageCheckinTime % 60);
    const averageCheckin = `${String(averageCheckinHours).padStart(2, '0')}:${String(averageCheckinMinutes).padStart(2, '0')}`;

    const averageCheckoutHours = Math.floor(averageCheckoutTime / 60);
    const averageCheckoutMinutes = Math.floor(averageCheckoutTime % 60);
    const averageCheckout = `${String(averageCheckoutHours).padStart(2, '0')}:${String(averageCheckoutMinutes).padStart(2, '0')}`;

    return res.status(200).json({
      averageCheckinTime: averageCheckin,
      averageCheckoutTime: averageCheckout,
      averageWorkingTime: averageDuration.toFixed(2)
    });
  } catch (error) {
    return res.status(500).send('Internal server error: ' + error.message);
  }
};

const singleUserAttendance = async (req, res) => {
  const { employeeId } = req.params; 

  console.log(`Fetching attendance for employee ID: ${employeeId}`); // Add logging

  try {
    const isEmployee = await prisma.employee.findFirst({
      where: {
        employee_id: employeeId
      }
    });

    if (!isEmployee) {
      console.log(`Employee with ID: ${employeeId} not found`); // Add logging
      return res.status(400).send('Employee data not found');
    }

    const employeeAttendance = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId
      }
    });

    return res.status(200).send(employeeAttendance);
  } catch (error) {
    console.error('Error fetching employee attendance:', error); // Add logging
    return res.status(500).send('Internal server error: ' + error.message);
  }
};

const approveSingleAttendance = async (req, res) => {
  const { employeeId, adminEmail, year, month, selectedIds } = req.body;

  try {
    if (!year || !month || !selectedIds) {
      return res.status(400).json({ message: 'Invalid parameters. Please provide year, month, and selectedIds.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (user.role !== 'Manager' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' });
    }

    const updatedAttendance = await prisma.attendance.updateMany({
      where: {
        id: { in: selectedIds }
      },
      data: { status: 'approved' }
    });

    console.log('Attendance approval successful:', updatedAttendance);
    return res.status(200).json({ message: 'Attendance approved', updatedAttendance });
  } catch (error) {
    console.error('Error approving attendance:', error);
    return res.status(500).json({ error: error.message });
  }
};

const declineSingleAttendance = async (req, res) => {
  const { employeeId, adminEmail, year, month, selectedIds } = req.body;

  try {
    if (!year || !month || !selectedIds) {
      return res.status(400).json({ message: 'Invalid parameters. Please provide year, month, and selectedIds.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (user.role !== 'Manager' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Manager or Admin can approve attendance.' });
    }

    const updatedAttendance = await prisma.attendance.updateMany({
      where: {
        id: { in: selectedIds }
      },
      data: { status: 'declined' }
    });

    console.log('Attendance declination successful:', updatedAttendance);
    return res.status(200).json({ message: 'Attendance declined', updatedAttendance });
  } catch (error) {
    console.error('Error declining attendance:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  clockIn, 
  clockOut, 
  employeeReport, 
  getAttendance,
  getAllAttendance,
  getAverageWorkingTime, 
  singleUserAttendance,
  approveSingleAttendance,
  declineSingleAttendance
};
