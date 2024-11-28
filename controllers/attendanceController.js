const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dns = require('dns');
const os = require('os');

const isConnectedToCompanyWifi = async (req) => {
  try {
    // Get client IP first
    const clientIP = 
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.headers['x-real-ip'] || 
      req.headers['x-client-ip'] || 
      req.connection.remoteAddress?.replace(/^::ffff:/, '');

    console.log('Client IP:', clientIP);

    // Company office network configurations
    const allowedNetworks = [
      {
        cidr: '192.168.1.0/24',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        description: 'Office Network 1'
      },
      {
        cidr: '192.168.29.0/24',
        subnet: '255.255.255.0',
        gateway: '192.168.29.1',
        description: 'Office Network 2'
      },
      {
        cidr: '10.0.0.0/24',
        subnet: '255.255.255.0',
        description: 'Azure Internal Network'
      }
    ];

    // Function to check if IP is in subnet
    const isInSubnet = (ip, network) => {
      try {
        if (!ip) return false;
        
        const [networkAddr] = network.cidr.split('/');
        const ipParts = ip.split('.');
        const networkParts = networkAddr.split('.');
        const subnetParts = network.subnet.split('.');

        // Check if IP matches network address under subnet mask
        for (let i = 0; i < 4; i++) {
          const ipNum = parseInt(ipParts[i]);
          const networkNum = parseInt(networkParts[i]);
          const subnetNum = parseInt(subnetParts[i]);

          if ((ipNum & subnetNum) !== (networkNum & subnetNum)) {
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error(`Error checking subnet for IP ${ip}:`, error);
        return false;
      }
    };

    // If we're in production (Azure)
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment detected');
      
      // Check client IP
      const matchedNetwork = allowedNetworks.find(network => 
        isInSubnet(clientIP, network)
      );

      if (matchedNetwork) {
        console.log(`Client IP ${clientIP} matched network: ${matchedNetwork.description}`);
        return true;
      }

      // Also check server's network interfaces as fallback
      const networkInterfaces = os.networkInterfaces();
      const allIPv4Interfaces = Object.values(networkInterfaces)
        .flat()
        .filter(interface => 
          interface.family === 'IPv4' && 
          !interface.internal
        );

      for (const interface of allIPv4Interfaces) {
        const matchedNetwork = allowedNetworks.find(network => 
          isInSubnet(interface.address, network)
        );

        if (matchedNetwork) {
          console.log(`Server interface ${interface.address} matched network: ${matchedNetwork.description}`);
          return true;
        }
      }
    } else {
      // Local development environment
      const networkInterfaces = os.networkInterfaces();
      const allIPv4Interfaces = Object.values(networkInterfaces)
        .flat()
        .filter(interface => 
          interface.family === 'IPv4' && 
          !interface.internal
        );

      for (const interface of allIPv4Interfaces) {
        const matchedNetwork = allowedNetworks.find(network => 
          isInSubnet(interface.address, network)
        );

        if (matchedNetwork) {
          console.log(`Local interface ${interface.address} matched network: ${matchedNetwork.description}`);
          return true;
        }
      }
    }

    console.log('No allowed networks found');
    return false;

  } catch (error) {
    console.error('Error checking network connection:', error);
    console.error('Stack:', error.stack);
    return false;
  }
};

const clockIn = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`ClockIn request received with email: ${email}`);
    
    // Check if connected to company WiFi
    const isCompanyWifi = await isConnectedToCompanyWifi(req);
    if (!isCompanyWifi) {
      return res.status(403).json({ 
        message: 'Clock-in is only allowed when connected to company WiFi network.',
        error: 'INVALID_NETWORK'
      });
    }

    // Check if user exists with department info
    const user = await prisma.user.findFirst({ 
      where: { email },
      include: {
        employee: true // Include employee relation to get additional details
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found. Please login or register as a user.' });
    }

    // Check if user has already clocked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        companyEmail: email,
        date: {
          gte: today
        },
        checkout_Time: null
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already clocked in today.' });
    }

    // Create new attendance record with department
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: user.employeeId,
        checkin_Time: new Date(),
        companyEmail: email,
        status: 'pending',
        employeeName: user.username,
        joinDate: user.joiningDate,
        Department: user.department, // Add department from user
        date: new Date(),
        employeeImage: user.employee?.employeeImg || null // Add employee image if available
      }
    });

    return res.status(200).json({ 
      message: 'Clock-in successful', 
      attendance,
      isClockedIn: true,
      clockInTime: attendance.checkin_Time 
    });
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
      return res.status(400).json({ message: 'User not found.' });
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
      return res.status(400).json({ message: 'No active clock-in record found.' });
    }

    // Extract media URLs from the rich content if needed
    const mediaUrls = extractMediaUrls(reportText); // Implement this helper function

    const attendance = await prisma.attendance.update({
      where: {
        id: latestAttendance.id
      },
      data: {
        reports: reportText,
        reportMedia: mediaUrls
      }
    });

    return res.status(200).json({ message: 'Report submission successful', attendance });
  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Helper function to extract media URLs
const extractMediaUrls = (content) => {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const videoRegex = /<iframe[^>]+src="([^">]+)"/g;
  
  const urls = [];
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  while ((match = videoRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
};

const clockOut = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`ClockOut request received with email: ${email}`);

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Find today's active attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        companyEmail: email,
        date: {
          gte: today
        },
        checkout_Time: null
      }
    });

    if (!activeAttendance) {
      return res.status(400).json({ message: 'No active clock-in record found.' });
    }

    // Update the attendance record with checkout time
    const attendance = await prisma.attendance.update({
      where: {
        id: activeAttendance.id
      },
      data: {
        checkout_Time: new Date()
      }
    });

    return res.status(200).json({ 
      message: 'Clock-out successful', 
      attendance,
      isClockedIn: false,
      clockOutTime: attendance.checkout_Time
    });
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
    // First check if employee exists and get their details including user info
    const isEmployee = await prisma.employee.findFirst({
      where: {
        employee_id: employeeId
      },
      include: {
        users: {
          select: {
            department: true,
            mainPosition: true
          }
        }
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
      firstDayOfWeek.setDate(firstDayOfYear.getDate() + (week - 1) * 7 - firstDayOfYear.getDay() + 1);
      dateFilter.gte = firstDayOfWeek;
      dateFilter.lt = new Date(firstDayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      hasDateFilter = true;
    }

    // Get attendance records with employee and user details
    const attendanceByEmployeeId = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId,
        ...(hasDateFilter && { date: dateFilter })
      },
      include: {
        employee: {
          include: {
            users: {
              select: {
                department: true,
                mainPosition: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Process the attendance records to include department
    const processedAttendance = attendanceByEmployeeId.map(record => {
      const department = record.employee?.users[0]?.department || 
                        record.employee?.department || 
                        record.Department || 
                        'Not Assigned';
      
      const position = record.employee?.users[0]?.mainPosition || 
                      record.employee?.position || 
                      'Not Assigned';

      return {
        ...record,
        department,
        position,
        // Remove nested objects to clean up the response
        employee: undefined
      };
    });

    console.log(`Found ${processedAttendance.length} attendance records for employee ${employeeId}`);
    return res.status(200).json({
      employeeDetails: {
        id: isEmployee.employee_id,
        name: `${isEmployee.firstname} ${isEmployee.lastname}`,
        department: isEmployee.users[0]?.department || isEmployee.department || 'Not Assigned',
        position: isEmployee.users[0]?.mainPosition || isEmployee.position || 'Not Assigned'
      },
      attendance: processedAttendance
    });

  } catch (error) {
    console.error('Error in getAllAttendance:', error);
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

// Add a new endpoint to check clock-in status
const getClockStatus = async (req, res) => {
  try {
    const { email } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        companyEmail: email,
        date: {
          gte: today
        }
      },
      orderBy: {
        checkin_Time: 'desc'
      }
    });

    if (!attendance) {
      return res.status(200).json({ 
        isClockedIn: false,
        clockInTime: null,
        clockOutTime: null
      });
    }

    return res.status(200).json({
      isClockedIn: !attendance.checkout_Time,
      clockInTime: attendance.checkin_Time,
      clockOutTime: attendance.checkout_Time
    });
  } catch (error) {
    console.error('Error getting clock status:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Add endpoint to get daily clock status
const getDailyClockStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        companyEmail: email,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      hasClockedInToday: attendance ? !!attendance.checkin_Time : false,
      hasClockedOutToday: attendance ? !!attendance.checkout_Time : false,
      clockInTime: attendance && attendance.checkin_Time ? attendance.checkin_Time : null,
      clockOutTime: attendance && attendance.checkout_Time ? attendance.checkout_Time : null,
      hasSubmittedReport: attendance ? !!attendance.reports : false
    });
  } catch (error) {
    console.error('Error checking daily clock status:', error);
    res.status(500).json({ message: 'Error checking daily clock status' });
  }
};

const getTodaysAttendance = async (req, res) => {
  try {
    console.log('Starting getTodaysAttendance...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch employees with user information
    console.log('Fetching employees with user details...');
    const employees = await prisma.employee.findMany({
      select: {
        employee_id: true,
        firstname: true,
        lastname: true,
        email: true,
        department: true,
        employeeImg: true,
        users: {
          select: {
            department: true
          }
        }
      }
    });

    console.log(`Found ${employees.length} employees`);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    console.log(`Found ${attendanceRecords.length} attendance records`);

    const todaysAttendance = employees.map(employee => {
      const attendance = attendanceRecords.find(
        record => record.employeeId === employee.employee_id
      );

      // Use department from user if available, otherwise fall back to employee department
      const department = employee.users[0]?.department || employee.department || 'N/A';

      return {
        employeeId: employee.employee_id,
        employeeName: `${employee.firstname} ${employee.lastname}`.trim(),
        email: employee.email,
        department: department,
        profileImage: employee.employeeImg,
        checkin_Time: attendance ? attendance.checkin_Time : null,
        checkout_Time: attendance ? attendance.checkout_Time : null,
        status: attendance ? attendance.status : 'absent',
        date: today
      };
    });

    console.log('Successfully processed attendance data');
    return res.status(200).json(todaysAttendance);

  } catch (error) {
    console.error('Detailed error in getTodaysAttendance:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
  declineSingleAttendance,
  getClockStatus,
  getDailyClockStatus,
  getTodaysAttendance
};
