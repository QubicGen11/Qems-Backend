const approveLeave = async (req, res) => {
  try {
    const {
      companyEmail,
      employeeEmail,
      leaveId
    } = req.body;

    // Your existing leave approval logic
    const updatedLeave = await prisma.leaveRequest.update({
      where: {
        leave_id: leaveId
      },
      data: {
        status: 'Approved'
      },
      include: {
        employee: true // Include employee details
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        employeeId: updatedLeave.employee.employee_id,
        message: `Your leave request from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()} has been approved`,
        type: 'LEAVE_APPROVED',
        isRead: false
      }
    });
    res.json({
      success: true,
      employeeId: updatedLeave.employee.employee_id
    });
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve leave request'
    });
  }
};
const declineLeave = async (req, res) => {
  try {
    const {
      companyEmail,
      employeeEmail,
      leaveId
    } = req.body;

    // Your existing leave rejection logic
    const updatedLeave = await prisma.leaveRequest.update({
      where: {
        leave_id: leaveId
      },
      data: {
        status: 'Rejected'
      },
      include: {
        employee: true // Include employee details
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        employeeId: updatedLeave.employee.employee_id,
        message: `Your leave request from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()} has been rejected`,
        type: 'LEAVE_REJECTED',
        isRead: false
      }
    });
    res.json({
      success: true,
      employeeId: updatedLeave.employee.employee_id
    });
  } catch (error) {
    console.error('Error declining leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline leave request'
    });
  }
};
module.exports = {
  approveLeave,
  declineLeave
};