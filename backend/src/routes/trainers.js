const express = require('express');
const router = express.Router();

// Get all trainers
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Trainers retrieved successfully',
    data: {
      trainers: [
        { id: 1, name: 'Carlos Ferreira', specialization: 'Musculação', status: 'active' },
        { id: 2, name: 'Pedro Santos', specialization: 'Cardio', status: 'active' }
      ],
      total: 2
    }
  });
});

// Get trainer by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Trainer retrieved successfully',
    data: {
      id: parseInt(id),
      name: 'Carlos Ferreira',
      email: 'carlos@email.com',
      specialization: 'Musculação',
      status: 'active'
    }
  });
});

// Create trainer
router.post('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Trainer created successfully',
    data: {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// Update trainer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Trainer updated successfully',
    data: {
      id: parseInt(id),
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete trainer
router.delete('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'Trainer deleted successfully'
  });
});

module.exports = router;