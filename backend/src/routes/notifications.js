const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const notificationController = require('../controllers/notificationController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createNotificationValidation = [
  body('recipient_id').isInt().withMessage('ID do destinatário deve ser um número'),
  body('type').isIn(['system', 'payment', 'workout', 'checkin', 'subscription', 'announcement', 'reminder', 'welcome', 'achievement', 'schedule', 'promotion']).withMessage('Tipo inválido'),
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('message').notEmpty().withMessage('Mensagem é obrigatória'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Prioridade inválida'),
  body('channel').optional().isIn(['in_app', 'email', 'sms', 'push']).withMessage('Canal inválido'),
  body('data').optional().isObject(),
  body('expires_at').optional().isISO8601().withMessage('Data de expiração inválida'),
  body('action_url').optional().isString(),
  body('action_text').optional().isString()
];

/**
 * @route GET /api/notifications
 * @desc Get all notifications for current user
 * @access Private
 */
router.get('/', 
  auth, 
  notificationController.getNotifications
);

/**
 * @route GET /api/notifications/unread
 * @desc Get unread notifications for current user
 * @access Private
 */
router.get('/unread', 
  auth, 
  notificationController.getUnreadNotifications
);

/**
 * @route GET /api/notifications/count
 * @desc Get unread notifications count
 * @access Private
 */
router.get('/count', 
  auth, 
  notificationController.getUnreadCount
);

/**
 * @route GET /api/notifications/stats
 * @desc Get notification statistics
 * @access Private (Admin, Manager)
 */
router.get('/stats', 
  auth, 
  authorize(['admin', 'manager']), 
  notificationController.getNotificationStats
);

/**
 * @route GET /api/notifications/:id
 * @desc Get notification by ID
 * @access Private
 */
router.get('/:id', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  notificationController.getNotificationById
);

/**
 * @route POST /api/notifications
 * @desc Create new notification
 * @access Private (Admin, Manager)
 */
router.post('/', 
  auth, 
  authorize(['admin', 'manager']), 
  createNotificationValidation, 
  validate, 
  notificationController.createNotification
);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  notificationController.markAsRead
);

/**
 * @route PUT /api/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/mark-all-read', 
  auth, 
  notificationController.markAllAsRead
);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete notification
 * @access Private (Admin, Manager, Own notification)
 */
router.delete('/:id', 
  auth, 
  param('id').isInt().withMessage('ID deve ser um número'),
  validate,
  notificationController.deleteNotification
);

module.exports = router;