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
        role: true
      }
    });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: employee
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