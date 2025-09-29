const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const studentController = require('../controllers/studentController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createStudentValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('birth_date').optional().isISO8601().withMessage('Data de nascimento inválida'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gênero inválido'),
  body('emergency_contact').optional().isString(),
  body('emergency_phone').optional().isMobilePhone('pt-BR').withMessage('Telefone de emergência inválido'),
  body('medical_conditions').optional().isString(),
  body('goals').optional().isArray(),
  body('plan_id').optional().isInt().withMessage('ID do plano deve ser um número')
];

const updateStudentValidation = [
  param('id').isInt().withMessage('ID deve ser um número'),
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('birth_date').optional().isISO8601().withMessage('Data de nascimento inválida'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gênero inválido'),
  body('emergency_contact').optional().isString(),
  body('emergency_phone').optional().isMobilePhone('pt-BR').withMessage('Telefone de emergência inválido'),
  body('medical_conditions').optional().isString(),
  body('goals').optional().isArray(),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Status inválido')
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número')
];

/**
 * @route GET /api/students
 * @desc Get all students with filtering and pagination
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  studentController.getAllStudents
);

/**
 * @route GET /api/students/search
 * @desc Search students
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/search', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  studentController.getAllStudents
);

/**
 * @route GET /api/students/stats
 * @desc Get students statistics
 * @access Private (Admin, Manager)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager']), 
  studentController.getStudentsStats
);

/**
 * @route GET /api/students/:id
 * @desc Get student by ID
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/:id', 
  auth, 
  idValidation, 
  validate, 
  studentController.getStudent
);

/**
 * @route GET /api/students/:id/profile
 * @desc Get student full profile
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/:id/profile', 
  auth, 
  idValidation, 
  validate, 
  studentController.getStudent
);

/**
 * @route GET /api/students/:id/subscriptions
 * @desc Get student subscriptions
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/:id/subscriptions', 
  auth, 
  idValidation, 
  validate, 
  studentController.getStudentSubscriptions
);

/**
 * @route GET /api/students/:id/workouts
 * @desc Get student workouts
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/:id/workouts', 
  auth, 
  idValidation, 
  validate, 
  studentController.getStudentWorkouts
);

/**
 * @route GET /api/students/:id/checkins
 * @desc Get student checkins
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/:id/checkins', 
  auth, 
  idValidation, 
  validate, 
  studentController.getStudentCheckins
);

/**
 * @route GET /api/students/:id/payments
 * @desc Get student payments
 * @access Private (Admin, Manager, Own student)
 */
router.get('/:id/payments', 
  auth, 
  authorize(['admin', 'manager', 'student']),
  idValidation, 
  validate, 
  studentController.getStudentPayments
);

/**
 * @route POST /api/students
 * @desc Create new student
 * @access Private (Admin, Manager)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager']), 
  createStudentValidation, 
  validate, 
  studentController.createStudent
);

/**
 * @route POST /api/students/bulk
 * @desc Bulk create students
 * @access Private (Admin, Manager)
 */
router.post('/bulk', 
  auth, 
  authorize(['admin', 'manager']), 
  studentController.bulkCreateStudents
);

/**
 * @route PUT /api/students/:id
 * @desc Update student
 * @access Private (Admin, Manager, Own student)
 */
router.put('/:id', 
  auth, 
  updateStudentValidation, 
  validate, 
  studentController.updateStudent
);

/**
 * @route PUT /api/students/:id/status
 * @desc Update student status
 * @access Private (Admin, Manager)
 */
router.put('/:id/status', 
  auth, 
  authorize(['admin', 'manager']),
  idValidation,
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Status inválido'),
  validate, 
  studentController.updateStudentStatus
);

/**
 * @route DELETE /api/students/:id
 * @desc Delete student
 * @access Private (Admin, Manager)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin', 'manager']), 
  idValidation, 
  validate, 
  studentController.deleteStudent
);

/**
 * @route POST /api/students/:id/assign-plan
 * @desc Assign plan to student
 * @access Private (Admin, Manager)
 */
router.post('/:id/assign-plan', 
  auth, 
  authorize(['admin', 'manager']),
  idValidation,
  body('plan_id').isInt().withMessage('ID do plano deve ser um número'),
  validate, 
  studentController.assignPlan
);

/**
 * @route POST /api/students/:id/suspend
 * @desc Suspend student
 * @access Private (Admin, Manager)
 */
router.post('/:id/suspend', 
  auth, 
  authorize(['admin', 'manager']),
  idValidation,
  body('reason').optional().isString(),
  validate, 
  studentController.suspendStudent
);

/**
 * @route POST /api/students/:id/reactivate
 * @desc Reactivate student
 * @access Private (Admin, Manager)
 */
router.post('/:id/reactivate', 
  auth, 
  authorize(['admin', 'manager']),
  idValidation,
  validate, 
  studentController.reactivateStudent
);

module.exports = router;