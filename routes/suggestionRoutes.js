const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all suggestions
router.get('/api/suggestions', async (req, res) => {
  try {
    const suggestions = await prisma.suggestion.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
});

// Create new suggestion
router.post('/api/suggestions', async (req, res) => {
  const { content, category } = req.body;
  
  try {
    const suggestion = await prisma.suggestion.create({
      data: {
        content,
        category,
        status: 'pending',
        timestamp: new Date()
      }
    });
    res.status(201).json(suggestion);
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(400).json({ message: 'Failed to create suggestion' });
  }
});

// Delete suggestion (optional - for admin)
router.delete('/api/suggestions/:id', async (req, res) => {
  try {
    await prisma.suggestion.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ message: 'Failed to delete suggestion' });
  }
});

module.exports = router;