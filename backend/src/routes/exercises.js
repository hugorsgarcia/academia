const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const exerciseController = require('../controllers/exerciseController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createExerciseValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('muscle_group').notEmpty().withMessage('Grupo muscular é obrigatório'),
  body('equipment').optional().isString(),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Dificuldade inválida'),
  body('instructions').notEmpty().withMessage('Instruções são obrigatórias'),
  body('tips').optional().isString(),
  body('video_url').optional().isURL().withMessage('URL do vídeo inválida'),
  body('image_url').optional().isURL().withMessage('URL da imagem inválida'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duração deve ser um número positivo'),
  body('calories_per_minute').optional().isFloat({ min: 0 }).withMessage('Calorias devem ser um número positivo'),
  body('tags').optional().isArray()
];

const updateExerciseValidation = [
  param('id').isInt().withMessage('ID deve ser um número'),
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('muscle_group').optional().notEmpty().withMessage('Grupo muscular não pode estar vazio'),
  body('equipment').optional().isString(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Dificuldade inválida'),
  body('instructions').optional().notEmpty().withMessage('Instruções não podem estar vazias'),
  body('tips').optional().isString(),
  body('video_url').optional().isURL().withMessage('URL do vídeo inválida'),
  body('image_url').optional().isURL().withMessage('URL da imagem inválida'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duração deve ser um número positivo'),
  body('calories_per_minute').optional().isFloat({ min: 0 }).withMessage('Calorias devem ser um número positivo'),
  body('tags').optional().isArray(),
  body('is_active').optional().isBoolean()
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número')
];

/**
 * @route GET /api/exercises
 * @desc Get all exercises with filtering and pagination
 * @access Private (All authenticated users)
 */
router.get('/', 
  auth, 
  exerciseController.getAllExercises
);

/**
 * @route GET /api/exercises/search
 * @desc Search exercises
 * @access Private (All authenticated users)
 */
router.get('/search', 
  auth, 
  exerciseController.searchExercises
);

/**
 * @route GET /api/exercises/muscle-groups
 * @desc Get all muscle groups
 * @access Private (All authenticated users)
 */
router.get('/muscle-groups', 
  auth, 
  exerciseController.getMuscleGroups
);

/**
 * @route GET /api/exercises/equipment
 * @desc Get all equipment types
 * @access Private (All authenticated users)
 */
router.get('/equipment', 
  auth, 
  exerciseController.getEquipmentTypes
);

/**
 * @route GET /api/exercises/stats
 * @desc Get exercise statistics
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  exerciseController.getExerciseStats
);

/**
 * @route GET /api/exercises/popular
 * @desc Get popular exercises
 * @access Private (All authenticated users)
 */
router.get('/popular', 
  auth, 
  exerciseController.getPopularExercises
);

/**
 * @route GET /api/exercises/by-muscle-group/:muscleGroup
 * @desc Get exercises by muscle group
 * @access Private (All authenticated users)
 */
router.get('/by-muscle-group/:muscleGroup', 
  auth, 
  param('muscleGroup').notEmpty().withMessage('Grupo muscular é obrigatório'),
  validate,
  exerciseController.getExercisesByMuscleGroup
);

/**
 * @route GET /api/exercises/by-difficulty/:difficulty
 * @desc Get exercises by difficulty
 * @access Private (All authenticated users)
 */
router.get('/by-difficulty/:difficulty', 
  auth, 
  param('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Dificuldade inválida'),
  validate,
  exerciseController.getExercisesByDifficulty
);

/**
 * @route GET /api/exercises/:id
 * @desc Get exercise by ID
 * @access Private (All authenticated users)
 */
router.get('/:id', 
  auth, 
  idValidation, 
  validate, 
  exerciseController.getExerciseById
);

/**
 * @route GET /api/exercises/:id/variations
 * @desc Get exercise variations
 * @access Private (All authenticated users)
 */
router.get('/:id/variations', 
  auth, 
  idValidation, 
  validate, 
  exerciseController.getExerciseVariations
);

/**
 * @route POST /api/exercises
 * @desc Create new exercise
 * @access Private (Admin, Manager, Trainer)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  createExerciseValidation, 
  validate, 
  exerciseController.createExercise
);

/**
 * @route POST /api/exercises/bulk
 * @desc Bulk create exercises
 * @access Private (Admin, Manager)
 */
router.post('/bulk', 
  auth, 
  authorize(['admin', 'manager']), 
  exerciseController.bulkCreateExercises
);

/**
 * @route PUT /api/exercises/:id
 * @desc Update exercise
 * @access Private (Admin, Manager, Trainer)
 */
router.put('/:id', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  updateExerciseValidation, 
  validate, 
  exerciseController.updateExercise
);

/**
 * @route PUT /api/exercises/:id/status
 * @desc Update exercise status
 * @access Private (Admin, Manager, Trainer)
 */
router.put('/:id/status', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  idValidation,
  body('is_active').isBoolean().withMessage('Status deve ser booleano'),
  validate, 
  exerciseController.updateExerciseStatus
);

/**
 * @route DELETE /api/exercises/:id
 * @desc Delete exercise
 * @access Private (Admin, Manager)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin', 'manager']), 
  idValidation, 
  validate, 
  exerciseController.deleteExercise
);

/**
 * @route POST /api/exercises/:id/favorite
 * @desc Add exercise to favorites
 * @access Private (All authenticated users)
 */
router.post('/:id/favorite', 
  auth, 
  idValidation, 
  validate, 
  exerciseController.addToFavorites
);

/**
 * @route DELETE /api/exercises/:id/favorite
 * @desc Remove exercise from favorites
 * @access Private (All authenticated users)
 */
router.delete('/:id/favorite', 
  auth, 
  idValidation, 
  validate, 
  exerciseController.removeFromFavorites
);

/**
 * @route GET /api/exercises/favorites/my
 * @desc Get user's favorite exercises
 * @access Private (All authenticated users)
 */
router.get('/favorites/my', 
  auth, 
  exerciseController.getUserFavorites
);

/**
 * @route POST /api/exercises/:id/log-usage
 * @desc Log exercise usage for analytics
 * @access Private (All authenticated users)
 */
router.post('/:id/log-usage', 
  auth, 
  idValidation, 
  validate, 
  exerciseController.logExerciseUsage
);

module.exports = router;