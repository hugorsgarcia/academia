const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const blogController = require('../controllers/blogController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createArticleValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('content').notEmpty().withMessage('Conteúdo é obrigatório'),
  body('excerpt').optional().isString(),
  body('category').optional().isString(),
  body('tags').optional().isArray(),
  body('featured_image').optional().isURL().withMessage('URL da imagem inválida'),
  body('is_featured').optional().isBoolean()
];

/**
 * @route GET /api/blog
 * @desc Get all published articles with pagination
 * @access Public
 */
router.get('/', blogController.getAllArticles);

// Get blog post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Blog post retrieved successfully',
    data: {
      id: parseInt(id),
      title: 'Como treinar peito corretamente',
      content: 'Conteúdo do post...',
      status: 'published'
    }
  });
});

// Create blog post
router.post('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Blog post created successfully',
    data: {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// Update blog post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: 'Blog post updated successfully',
    data: {
      id: parseInt(id),
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
});

module.exports = router;