const express = require('express');
const router = express.Router();

// Import controllers
const subscriptionController = require('../controllers/subscriptionController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route POST /api/subscriptions/send-expiry-reminders
 * @desc Triggers sending of expiry reminders to students
 * @access Private (Admin, Manager) - Can be called by a cron job
 */
router.post('/send-expiry-reminders',
  auth,
  authorize(['admin', 'manager']),
  subscriptionController.sendExpiryReminders
);

module.exports = router;