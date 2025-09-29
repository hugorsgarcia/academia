const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const checkinController = require('../controllers/checkinController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createCheckinValidation = [
  body('student_id').isInt().withMessage('ID do aluno deve ser um número'),
  body('location').optional().isString(),
  body('notes').optional().isString()
];

const checkoutValidation = [
  param('id').isInt().withMessage('ID deve ser um número'),
  body('notes').optional().isString()
];

/**
 * @route GET /api/checkins
 * @desc Get all checkins with filtering and pagination
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  checkinController.getAllCheckins
);

/**
 * @route GET /api/checkins/my
 * @desc Get current user's checkins
 * @access Private (Student)
 */
router.get('/my', 
  auth, 
  authorize(['student']), 
  checkinController.getMyCheckins
);

/**
 * @route GET /api/checkins/active
 * @desc Get currently active checkins
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/active', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  checkinController.getActiveCheckins
);

/**
 * @route GET /api/checkins/stats
 * @desc Get checkin statistics
 * @access Private (Admin, Manager)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager']), 
  checkinController.getCheckinStats
);

/**
 * @route GET /api/checkins/today
 * @desc Get today's checkins
 * @access Private (Admin, Manager, Trainer)
 */
router.get('/today', 
  auth, 
  authorize(['admin', 'manager', 'trainer']), 
  checkinController.getTodaysCheckins
);

/**
 * @route GET /api/checkins/student/:studentId
 * @desc Get checkins by student
 * @access Private (Admin, Manager, Trainer, Own student)
 */
router.get('/student/:studentId', 
  auth, 
  param('studentId').isInt().withMessage('ID do aluno deve ser um número'),
  validate,
  checkinController.getStudentCheckins
);

/**
 * @route GET /api/checkins/:id
 * @desc Get checkin by ID
 * @access Private (Admin, Manager, Trainer, Own checkin)
 */
router.get('/:id', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  checkinController.getCheckinById
);

/**
 * @route POST /api/checkins
 * @desc Create new checkin
 * @access Private (Admin, Manager, Trainer, Student)
 */
router.post('/', 
  auth, 
  createCheckinValidation, 
  validate, 
  checkinController.createCheckin
);

/**
 * @route POST /api/checkins/qr
 * @desc Checkin using QR code
 * @access Private (Student)
 */
router.post('/qr', 
  auth, 
  authorize(['student']),
  body('qr_code').notEmpty().withMessage('Código QR é obrigatório'),
  validate,
  checkinController.checkinWithQR
);

/**
 * @route PUT /api/checkins/:id/checkout
 * @desc Checkout from checkin
 * @access Private (Admin, Manager, Trainer, Own checkin)
 */
router.put('/:id/checkout', 
  auth, 
  checkoutValidation,
  validate,
  checkinController.checkout
);

/**
 * @route PUT /api/checkins/:id
 * @desc Update checkin
 * @access Private (Admin, Manager)
 */
router.put('/:id', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('notes').optional().isString(),
  body('location').optional().isString(),
  validate,
  checkinController.updateCheckin
);

/**
 * @route DELETE /api/checkins/:id
 * @desc Delete checkin
 * @access Private (Admin, Manager)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  checkinController.deleteCheckin
);

/**
 * @route GET /api/checkins/report/attendance
 * @desc Get attendance report
 * @access Private (Admin, Manager)
 */
router.get('/report/attendance', 
  auth, 
  authorize(['admin', 'manager']),
  checkinController.getAttendanceReport
);

/**
 * @route GET /api/checkins/report/peak-hours
 * @desc Get peak hours report
 * @access Private (Admin, Manager)
 */
router.get('/report/peak-hours', 
  auth, 
  authorize(['admin', 'manager']),
  checkinController.getPeakHoursReport
);

module.exports = router;