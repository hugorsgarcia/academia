const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, userType, name, role } = req.body;

      // Check if user already exists
      const existingUser = await User.query().findOne({ email });
      if (existingUser) {
        return next(new AppError('Email already registered', 400));
      }

      // Support both old format (firstName + lastName + userType) and new format (name + role)
      const userName = name || `${firstName || ''} ${lastName || ''}`.trim();
      const userRole = role || userType;

      // Create user
      const user = await User.query().insertAndFetch({
        email,
        password,
        name: userName,
        role: userRole,
        isActive: true
      });

      // If user is a student, create student record
      if (userRole === 'student') {
        await Student.query().insert({
          user_id: user.id,
          registration_number: `STU${Date.now()}`,
          status: 'pending'
        });

        // Send welcome email to student
        try {
          await sendEmail({
            to: user.email,
            template: 'welcome',
            data: {
              name: user.name,
              loginUrl: `${process.env.FRONTEND_URL}/aluno/login`
            }
          });
        } catch (emailError) {
          logger.error('Failed to send welcome email', { userId: user.id, error: emailError.message });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, userType: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      logger.info(`New user registered: ${email}`, { userId: user.id });

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.query()
        .findOne({ email })
        .select('id', 'email', 'password', 'name', 'role', 'isActive');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
      }

      if (!user.isActive) {
        return next(new AppError('Account is not active', 401));
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, userType: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      logger.info(`User logged in: ${email}`, { userId: user.id });

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.query().findById(decoded.userId);

      if (!user || user.status !== 'active') {
        return next(new AppError('Invalid refresh token', 401));
      }

      const newToken = jwt.sign(
        { userId: user.id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        data: { token: newToken }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      next(new AppError('Invalid refresh token', 401));
    }
  }

  async logout(req, res, next) {
    try {
      logger.info(`User logged out: ${req.user.email}`, { userId: req.user.id });
      
      res.json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.query().findOne({ email });
      if (!user) {
        return next(new AppError('No user found with that email address', 404));
      }

      // Generate reset token (in production, send via email)
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      logger.info(`Password reset requested: ${email}`, { userId: user.id });

      // Send password reset email
      try {
        const resetUrl = `${process.env.FRONTEND_URL}/resetar-senha?token=${resetToken}`;
        await sendEmail({
          to: user.email,
          template: 'passwordReset',
          data: {
            name: user.name,
            resetUrl
          }
        });
      } catch (emailError) {
        logger.error('Failed to send password reset email', { userId: user.id, error: emailError.message });
        // Do not expose email sending failure to the user for security reasons
      }

      res.json({
        status: 'success',
        message: 'Se um usuário com este e-mail existir, um link para redefinição de senha foi enviado.'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password-reset') {
        return next(new AppError('Invalid reset token', 400));
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      await User.query()
        .findById(decoded.userId)
        .patch({ password: hashedPassword });

      logger.info(`Password reset completed`, { userId: decoded.userId });

      res.json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      next(new AppError('Invalid or expired reset token', 400));
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.query().findById(userId);
      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Current password is incorrect', 400));
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await User.query()
        .findById(userId)
        .patch({ password: hashedPassword });

      logger.info(`Password changed`, { userId });

      res.json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.purpose !== 'email-verification') {
        return next(new AppError('Invalid verification token', 400));
      }

      await User.query()
        .findById(decoded.userId)
        .patch({ isEmailVerified: true });

      logger.info(`Email verified`, { userId: decoded.userId });

      res.json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      next(new AppError('Invalid or expired verification token', 400));
    }
  }

  async resendVerification(req, res, next) {
    try {
      const userId = req.user.id;

      const verificationToken = jwt.sign(
        { userId, purpose: 'email-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      logger.info(`Verification email resent`, { userId });

      res.json({
        status: 'success',
        message: 'Verification email sent',
        data: { verificationToken } // In production, send via email
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.query()
        .findById(userId)
        .select('id', 'email', 'name', 'role', 'isActive', 'created_at');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Se o usuário é um estudante, buscar dados adicionais do estudante
      let studentData = null;
      if (user.role === 'student') {
        const Student = require('../models/Student');
        studentData = await Student.query()
          .where('user_id', userId)
          .first();
      }

      res.json({
        status: 'success',
        data: { 
          user,
          student_id: studentData?.id || null,
          student: studentData || null
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { firstName, lastName } = req.body;

      const user = await User.query()
        .findById(userId)
        .patch({ firstName, lastName })
        .returning('*');

      logger.info(`Profile updated`, { userId });

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType
          }
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();