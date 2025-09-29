const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const paymentController = require('../controllers/paymentController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createPaymentValidation = [
  body('student_id').isInt().withMessage('ID do aluno deve ser um número'),
  body('subscription_id').optional().isInt().withMessage('ID da assinatura deve ser um número'),
  body('amount').isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  body('payment_method').isIn(['credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'boleto']).withMessage('Método de pagamento inválido'),
  body('due_date').isISO8601().withMessage('Data de vencimento inválida'),
  body('description').optional().isString(),
  body('discount_amount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser um número positivo'),
  body('late_fee').optional().isFloat({ min: 0 }).withMessage('Taxa de atraso deve ser um número positivo')
];

const updatePaymentValidation = [
  param('id').isInt().withMessage('ID deve ser um número'),
  body('status').optional().isIn(['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'overdue']).withMessage('Status inválido'),
  body('payment_method').optional().isIn(['credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'boleto']).withMessage('Método de pagamento inválido'),
  body('transaction_id').optional().isString(),
  body('notes').optional().isString(),
  body('discount_amount').optional().isFloat({ min: 0 }),
  body('late_fee').optional().isFloat({ min: 0 })
];

/**
 * @route GET /api/payments
 * @desc Get all payments with filtering and pagination
 * @access Private (Admin, Manager)
 */
router.get('/', 
  auth, 
  authorize(['admin', 'manager']), 
  paymentController.getAllPayments
);

/**
 * @route GET /api/payments/my
 * @desc Get current user's payments
 * @access Private (Student)
 */
router.get('/my', 
  auth, 
  authorize(['student']), 
  paymentController.getMyPayments
);

/**
 * @route GET /api/payments/overdue
 * @desc Get overdue payments
 * @access Private (Admin, Manager)
 */
router.get('/overdue', 
  auth, 
  authorize(['admin', 'manager']), 
  paymentController.getOverduePayments
);

/**
 * @route GET /api/payments/stats
 * @desc Get payment statistics
 * @access Private (Admin, Manager)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager']), 
  paymentController.getPaymentStats
);

/**
 * @route GET /api/payments/revenue
 * @desc Get revenue statistics
 * @access Private (Admin, Manager)
 */
router.get('/revenue', 
  auth, 
  authorize(['admin', 'manager']), 
  paymentController.getRevenueStats
);

/**
 * @route GET /api/payments/student/:studentId
 * @desc Get payments by student
 * @access Private (Admin, Manager, Own payments)
 */
router.get('/student/:studentId', 
  auth, 
  param('studentId').isInt().withMessage('ID do aluno deve ser um número'),
  validate,
  paymentController.getStudentPayments
);

/**
 * @route GET /api/payments/:id
 * @desc Get payment by ID
 * @access Private (Admin, Manager, Own payment)
 */
router.get('/:id', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  paymentController.getPaymentById
);

/**
 * @route GET /api/payments/:id/receipt
 * @desc Get payment receipt
 * @access Private (Admin, Manager, Own payment)
 */
router.get('/:id/receipt', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  paymentController.getPaymentReceipt
);

/**
 * @route POST /api/payments
 * @desc Create new payment
 * @access Private (Admin, Manager)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager']), 
  createPaymentValidation, 
  validate, 
  paymentController.createPayment
);

/**
 * @route POST /api/payments/process
 * @desc Process payment
 * @access Private (Admin, Manager, Student)
 */
router.post('/process', 
  auth, 
  body('payment_id').isInt().withMessage('ID do pagamento deve ser um número'),
  body('payment_method').isIn(['credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'boleto']).withMessage('Método de pagamento inválido'),
  body('payment_data').optional().isObject(),
  validate,
  paymentController.processPayment
);

/**
 * @route POST /api/payments/webhook
 * @desc Handle payment webhook
 * @access Public (Webhook)
 */
router.post('/webhook', 
  paymentController.handleWebhook
);

/**
 * @route PUT /api/payments/:id
 * @desc Update payment
 * @access Private (Admin, Manager)
 */
router.put('/:id', 
  auth, 
  authorize(['admin', 'manager']), 
  updatePaymentValidation, 
  validate, 
  paymentController.updatePayment
);

/**
 * @route PUT /api/payments/:id/status
 * @desc Update payment status
 * @access Private (Admin, Manager)
 */
router.put('/:id/status', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('status').isIn(['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'overdue']).withMessage('Status inválido'),
  body('notes').optional().isString(),
  validate,
  paymentController.updatePaymentStatus
);

/**
 * @route POST /api/payments/:id/refund
 * @desc Refund payment
 * @access Private (Admin, Manager)
 */
router.post('/:id/refund', 
  auth, 
  authorize(['admin', 'manager']),
  param('id').isInt().withMessage('ID deve ser um número'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  body('reason').optional().isString(),
  validate,
  paymentController.refundPayment
);

/**
 * @route DELETE /api/payments/:id
 * @desc Delete payment
 * @access Private (Admin)
 */
router.delete('/:id', 
  auth, 
  authorize(['admin']),
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  paymentController.deletePayment
);

/**
 * @route GET /api/payments/export/csv
 * @desc Export payments to CSV
 * @access Private (Admin, Manager)
 */
router.get('/export/csv', 
  auth, 
  authorize(['admin', 'manager']),
  paymentController.exportPaymentsCSV
);

/**
 * @route POST /api/payments/bulk-update
 * @desc Bulk update payments
 * @access Private (Admin, Manager)
 */
router.post('/bulk-update', 
  auth, 
  authorize(['admin', 'manager']),
  body('payment_ids').isArray().withMessage('IDs dos pagamentos devem ser um array'),
  body('updates').isObject().withMessage('Atualizações devem ser um objeto'),
  validate,
  paymentController.bulkUpdatePayments
);

module.exports = router;