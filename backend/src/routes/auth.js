const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const registerValidation = [
  // Support both old format (firstName + lastName) and new format (name)
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .custom((value, { req }) => {
      // Ensure either name is provided OR both firstName and lastName
      if (!value && (!req.body.firstName || !req.body.lastName)) {
        throw new Error('Nome completo é obrigatório (forneça "name" ou "firstName" + "lastName")');
      }
      return true;
    }),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  
  // Support both userType and role
  body(['userType', 'role'])
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'trainer', 'receptionist', 'student'])
    .withMessage('Tipo de usuário inválido')
    .custom((value, { req }) => {
      // Ensure either userType or role is provided
      if (!req.body.userType && !req.body.role) {
        throw new Error('Tipo de usuário é obrigatório (forneça "userType" ou "role")');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', auth, authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);
router.post('/change-password', auth, changePasswordValidation, validate, authController.changePassword);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', auth, authController.resendVerification);

// Profile routes
router.get('/me', auth, authController.getProfile);
router.put('/me', auth, authController.updateProfile);

module.exports = router;