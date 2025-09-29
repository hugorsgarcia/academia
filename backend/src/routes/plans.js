const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const planController = require('../controllers/planController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createPlanValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('duration_days').isInt({ min: 1 }).withMessage('Duração deve ser um número positivo'),
  body('benefits').optional().isArray(),
  body('max_students').optional().isInt({ min: 1 }).withMessage('Máximo de alunos deve ser um número positivo'),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Desconto deve estar entre 0 e 100'),
  body('is_popular').optional().isBoolean(),
  body('category').optional().isString()
];

/**
 * @route GET /api/plans
 * @desc Get all plans with filtering and pagination
 * @access Public
 */
router.get('/', 
  planController.getAllPlans
);

/**
 * @route GET /api/plans/active
 * @desc Get all active plans
 * @access Public
 */
router.get('/active', 
  planController.getActivePlans
);

/**
 * @route GET /api/plans/popular
 * @desc Get popular plans
 * @access Public
 */
router.get('/popular', 
  planController.getPopularPlans
);

/**
 * @route GET /api/plans/stats
 * @desc Get plan statistics
 * @access Private (Admin, Manager)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager']), 
  planController.getPlanStats
);

/**
 * @route GET /api/plans/:id
 * @desc Get plan by ID
 * @access Public
 */
router.get('/:id', 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  planController.getPlanById
);

/**
 * @route GET /api/plans/:id/subscriptions
 * @desc Get plan subscriptions
 * @access Private (Admin, Manager)
 */
router.get('/:id/subscriptions', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  planController.getPlanSubscriptions
);

/**
 * @route POST /api/plans
 * @desc Create new plan
 * @access Private (Admin, Manager)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager']), 
  createPlanValidation, 
  validate, 
  planController.createPlan
);

/**
 * @route PUT /api/plans/:id
 * @desc Update plan
 * @access Private (Admin, Manager)
 */
router.put('/:id', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  createPlanValidation.slice(0, -1), // Remove is_popular validation for update
  validate,
  planController.updatePlan
);

/**
 * @route PUT /api/plans/:id/status
 * @desc Update plan status
 * @access Private (Admin, Manager)
 */
router.put('/:id/status', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('is_active').isBoolean().withMessage('Status deve ser booleano'),
  validate,
  planController.updatePlanStatus
);

/**
 * @route DELETE /api/plans/:id
 * @desc Delete plan
 * @access Private (Admin, Manager)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  planController.deletePlan
);

/**
 * @route POST /api/plans/:id/subscribe
 * @desc Subscribe to plan
 * @access Private (Student)
 */
router.post('/:id/subscribe', 
  auth, 
  authorize(['student']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('payment_method').optional().isString(),
  validate,
  planController.subscribeToPlan
);

module.exports = router;