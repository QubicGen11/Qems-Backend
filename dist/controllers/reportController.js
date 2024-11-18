const checkReportStatus = async (req, res) => {
  try {
    const {
      email
    } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const report = await prisma.report.findFirst({
      where: {
        employeeEmail: email,
        createdAt: {
          gte: today
        }
      }
    });
    if (!report) {
      // Create a reminder notification if report is pending
      const employee = await prisma.employee.findFirst({
        where: {
          email
        }
      });
      if (employee) {
        await createNotificationForEmployee(employee.employee_id, NOTIFICATION_TYPES.REPORT_PENDING);
      }
    }
    res.json({
      hasSubmitted: !!report
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check report status'
    });
  }
};