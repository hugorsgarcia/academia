const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const workoutController = require('../controllers/workoutController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createWorkoutValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').optional().isString(),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Dificuldade inválida'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duração deve ser um número positivo'),
  body('target_muscle_groups').optional().isArray(),
  body('equipment_needed').optional().isArray(),
  body('instructions').optional().isString(),
  body('rest_between_sets').optional().isInt({ min: 0 }).withMessage('Descanso deve ser um número não negativo'),
  body('student_id').optional().isInt().withMessage('ID do aluno deve ser um número'),
  body('trainer_id').optional().isInt().withMessage('ID do instrutor deve ser um número'),
  body('exercises').optional().isArray()
];

/**
 * @route GET /api/workouts
 * @desc Get all workouts with filtering and pagination
 * @access Private (All authenticated users)
 */
router.get('/', 
  auth, 
  workoutController.getAllWorkouts
);

/**
 * @route GET /api/workouts/my
 * @desc Get current user's workouts
 * @access Private (All authenticated users)
 */
router.get('/my', 
  auth, 
  workoutController.getMyWorkouts
);

/**
 * @route GET /api/workouts/templates
 * @desc Get workout templates
 * @access Private (All authenticated users)
 */
router.get('/templates', 
  auth, 
  workoutController.getWorkoutTemplates
);

/**
 * @route GET /api/workouts/stats
 * @desc Get workout statistics
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  workoutController.getWorkoutStats
);

/**
 * @route GET /api/workouts/:id
 * @desc Get workout by ID
 * @access Private (All authenticated users)
 */
router.get('/:id', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  workoutController.getWorkoutById
);

/**
 * @route GET /api/workouts/:id/exercises
 * @desc Get workout exercises
 * @access Private (All authenticated users)
 */
router.get('/:id/exercises', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  workoutController.getWorkoutExercises
);

/**
 * @route POST /api/workouts
 * @desc Create new workout
 * @access Private (Admin, Manager, Trainer)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  createWorkoutValidation, 
  validate, 
  workoutController.createWorkout
);

/**
 * @route POST /api/workouts/:id/assign
 * @desc Assign workout to student
 * @access Private (Admin, Manager, Trainer)
 */
router.post('/:id/assign', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('student_id').isInt().withMessage('ID do aluno deve ser um número'),
  validate,
  workoutController.assignWorkout
);

/**
 * @route POST /api/workouts/:id/complete
 * @desc Mark workout as completed
 * @access Private (All authenticated users)
 */
router.post('/:id/complete', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  workoutController.completeWorkout
);

/**
 * @route PUT /api/workouts/:id
 * @desc Update workout
 * @access Private (Admin, Manager, Trainer)
 */
router.put('/:id', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('id').isInt().withMessage('ID deve ser um número'),
  createWorkoutValidation.slice(0, -1), // Remove exercises validation for update
  validate,
  workoutController.updateWorkout
);

/**
 * @route PUT /api/workouts/:id/status
 * @desc Update workout status
 * @access Private (Admin, Manager, Trainer)
 */
router.put('/:id/status', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('is_active').isBoolean().withMessage('Status deve ser booleano'),
  validate,
  workoutController.updateWorkoutStatus
);

/**
 * @route DELETE /api/workouts/:id
 * @desc Delete workout
 * @access Private (Admin, Manager, Trainer)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  workoutController.deleteWorkout
);

/**
 * @route POST /api/workouts/:id/exercises
 * @desc Add exercise to workout
 * @access Private (Admin, Manager, Trainer)
 */
router.post('/:id/exercises', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('exercise_id').isInt().withMessage('ID do exercício deve ser um número'),
  body('sets').isInt({ min: 1 }).withMessage('Sets deve ser um número positivo'),
  body('reps').optional().isString(),
  body('weight').optional().isString(),
  body('duration').optional().isString(),
  body('rest_time').optional().isInt({ min: 0 }),
  body('order_index').optional().isInt({ min: 0 }),
  validate,
  workoutController.addExerciseToWorkout
);

/**
 * @route PUT /api/workouts/:workoutId/exercises/:exerciseId
 * @desc Update exercise in workout
 * @access Private (Admin, Manager, Trainer)
 */
router.put('/:workoutId/exercises/:exerciseId', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('workoutId').isInt().withMessage('ID do treino deve ser um número'),
  param('exerciseId').isInt().withMessage('ID do exercício deve ser um número'),
  validate,
  workoutController.updateWorkoutExercise
);

/**
 * @route DELETE /api/workouts/:workoutId/exercises/:exerciseId
 * @desc Remove exercise from workout
 * @access Private (Admin, Manager, Trainer)
 */
router.delete('/:workoutId/exercises/:exerciseId', 
  auth, 
  authorize(['admin', 'manager', 'trainer']),
  param('workoutId').isInt().withMessage('ID do treino deve ser um número'),
  param('exerciseId').isInt().withMessage('ID do exercício deve ser um número'),
  validate,
  workoutController.removeExerciseFromWorkout
);

module.exports = router;