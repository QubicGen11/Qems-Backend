const {
  PrismaClient
} = require('@prisma/client');
const prisma = new PrismaClient();

// Get employee by ID
const getEmployeeById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    // Log the incoming request
    console.log('Fetching employee with ID:', id);
    const employee = await prisma.employee.findUnique({
      where: {
        employee_id: id
      }
    });
    console.log('Found employee:', employee); // Debug log

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with ID: ${id}`
      });
    }

    // Format the response
    const formattedEmployee = {
      employee_id: employee.employee_id,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      companyEmail: employee.companyEmail,
      department: employee.department,
      profileImage: employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName || '')}+${encodeURIComponent(employee.lastName || '')}&size=200&background=random`,
      position: employee.position
    };
    return res.status(200).json({
      success: true,
      data: formattedEmployee
    });
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get employee by email
const getEmployeeByEmail = async (req, res) => {
  const {
    email
  } = req.params;
  try {
    const employee = await prisma.employee.findFirst({
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
        role: true,
        phoneNumber: true,
        dateOfJoining: true,
        status: true
      }
    });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    const formattedEmployee = {
      ...employee,
      fullName: `${employee.firstName} ${employee.lastName}`,
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString() : null,
      profileImage: employee.profileImage || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random`
    };
    return res.status(200).json({
      success: true,
      data: formattedEmployee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update employee profile image
const updateEmployeeImage = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    profileImage
  } = req.body;
  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        employee_id: id
      },
      data: {
        profileImage
      },
      select: {
        employee_id: true,
        profileImage: true
      }
    });
    return res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile image',
      error: error.message
    });
  }
};

// Employee Leave Request function
const employeeLeaveRequest = async (req, res) => {
  const {
    companyEmail,
    leaveType,
    department,
    startDate,
    endDate,
    duration,
    reason,
    leaveDocument
  } = req.body;
  try {
    const isUser = await prisma.user.findUnique({
      where: {
        email: companyEmail
      }
    });
    if (!isUser) {
      return res.status(400).send('user is not found please register or login');
    }
    const newLeaveRequest = await prisma.leaveRequests.create({
      data: {
        employee_id: isUser.employeeId,
        companyEmail: isUser.email,
        department: department,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        reason: reason,
        status: 'pending',
        leaveDocument: leaveDocument
      }
    });
    return res.status(200).json({
      message: "leave request submitted",
      leaveRequest: newLeaveRequest
    });
  } catch (error) {
    return res.status(500).send('internal server error' + error.message);
  }
};
const employeeLeaveStatus = async (req, res) => {
  const {
    employeeEmail
  } = req.body;
  try {
    const isEmployee = await prisma.employee.findFirst({
      where: {
        companyEmail: employeeEmail
      }
    });
    if (!isEmployee) {
      return res.status(400).send('employee data not available');
    }
    const leaveRequests = await prisma.leaveRequests.findMany({
      where: {
        employee_id: isEmployee.employee_id
      },
      select: {
        status: true,
        startDate: true,
        endDate: true,
        leaveType: true,
        reason: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return res.status(200).json(leaveRequests);
  } catch (error) {
    return res.status(500).send('Internal error: ' + error.message);
  }
};
const getLeaveRequestsByEmail = async (req, res) => {
  const {
    email
  } = req.params;
  try {
    const leaveRequests = await prisma.leaveRequests.findMany({
      where: {
        companyEmail: email
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    if (!leaveRequests) {
      return res.status(404).json({
        message: 'No leave requests found'
      });
    }
    return res.status(200).json(leaveRequests);
  } catch (error) {
    return res.status(500).send('Internal error: ' + error.message);
  }
};
const allLeaveRequests = async (req, res) => {
  try {
    const allLeaveRequest = await prisma.leaveRequests.findMany({});
    return res.status(200).send(allLeaveRequest);
  } catch (error) {
    return res.status(500).send('internal error' + error.message);
  }
};
const approveLeaveRequests = async (req, res) => {
  const {
    companyEmail,
    employeeEmail,
    leaveId
  } = req.body;
  console.log('Approve request received:', {
    companyEmail,
    employeeEmail,
    leaveId
  });
  try {
    // Verify admin/manager status
    const isAdmin = await prisma.user.findFirst({
      where: {
        email: companyEmail,
        OR: [{
          role: 'Manager'
        }, {
          role: 'Admin'
        }]
      }
    });
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only managers or admins can approve leaves'
      });
    }

    // Update the leave request
    const updatedLeave = await prisma.leaveRequests.updateMany({
      where: {
        leave_id: parseInt(leaveId),
        companyEmail: employeeEmail,
        status: {
          in: ['Pending', 'pending']
        }
      },
      data: {
        status: 'Approved'
      }
    });
    if (updatedLeave.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending leave request found to approve'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Leave request approved successfully'
    });
  } catch (error) {
    console.error('Error in approveLeaveRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
const declineLeaveRequests = async (req, res) => {
  const {
    companyEmail,
    employeeEmail,
    leaveId
  } = req.body;
  console.log('Decline request received:', {
    companyEmail,
    employeeEmail,
    leaveId
  });
  try {
    // Verify admin/manager status
    const isAdmin = await prisma.user.findFirst({
      where: {
        email: companyEmail,
        OR: [{
          role: 'Manager'
        }, {
          role: 'Admin'
        }]
      }
    });
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only managers or admins can decline leaves'
      });
    }

    // Update the leave request
    const updatedLeave = await prisma.leaveRequests.updateMany({
      where: {
        leave_id: parseInt(leaveId),
        companyEmail: employeeEmail,
        status: {
          in: ['Pending', 'pending']
        }
      },
      data: {
        status: 'Rejected'
      }
    });
    if (updatedLeave.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending leave request found to decline'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Leave request declined successfully'
    });
  } catch (error) {
    console.error('Error in declineLeaveRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
const createNewHoliday = async (req, res) => {
  const {
    name,
    date,
    description,
    type
  } = req.body;
  try {
    const newHoliday = await prisma.holidays.create({
      data: {
        name,
        date: new Date(date),
        description,
        type
      }
    });
    return res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: newHoliday
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message
    });
  }
};
const deleteHoliday = async (req, res) => {
  const {
    holidayName
  } = req.params;
  try {
    await prisma.holidays.delete({
      where: {
        name: holidayName
      }
    });
    return res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message
    });
  }
};
const allHolidays = async (req, res) => {
  try {
    const holidays = await prisma.holidays.findMany({
      orderBy: {
        date: 'asc'
      }
    });
    return res.status(200).json({
      success: true,
      data: holidays
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: error.message
    });
  }
};

// New function to get leave statistics
const getLeaveStatistics = async (req, res) => {
  const {
    employeeId
  } = req.params;
  try {
    const leaveStats = await prisma.leaveRequests.groupBy({
      by: ['status'],
      where: {
        employee_id: employeeId
      },
      _count: {
        status: true
      }
    });
    return res.status(200).json({
      success: true,
      data: leaveStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics',
      error: error.message
    });
  }
};

// New function to get department leave summary
const getDepartmentLeavesSummary = async (req, res) => {
  const {
    department
  } = req.params;
  try {
    const departmentLeaves = await prisma.leaveRequests.findMany({
      where: {
        department: department
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    return res.status(200).json({
      success: true,
      data: departmentLeaves
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department leaves',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  employeeLeaveRequest,
  allLeaveRequests,
  approveLeaveRequests,
  declineLeaveRequests,
  createNewHoliday,
  deleteHoliday,
  allHolidays,
  getLeaveRequestsByEmail,
  employeeLeaveStatus,
  getEmployeeById,
  getEmployeeByEmail,
  updateEmployeeImage,
  getLeaveStatistics,
  getDepartmentLeavesSummary
};