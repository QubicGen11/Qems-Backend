const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all unique departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.user.findMany({
      select: {
        department: true
      },
      where: {
        department: {
          not: null
        }
      },
      distinct: ['department']
    });

    // Extract and format departments
    const formattedDepartments = departments
      .map(dept => dept.department)
      .filter(Boolean); // Remove any null/undefined values

    res.json(formattedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      details: error.message 
    });
  }
});

module.exports = router; 