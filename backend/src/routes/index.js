const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const healthRoutes = require('./health');
const subscriptionRoutes = require('./subscriptions');
// Temporarily disabled to isolate issues
// const userRoutes = require('./users');
// const studentRoutes = require('./students');
// const trainerRoutes = require('./trainers');
// const exerciseRoutes = require('./exercises');
// const workoutRoutes = require('./workouts');
// const planRoutes = require('./plans');
// const paymentRoutes = require('./payments');
// const checkinRoutes = require('./checkins');
// const blogRoutes = require('./blog');
// const notificationRoutes = require('./notifications');
// const reportRoutes = require('./reports');

// API version and info
router.get('/', (req, res) => {
  res.json({
    name: 'Academia Management System API',
    version: '1.0.0',
    description: 'Complete gym management system backend',
    author: 'Academia Team',
    endpoints: {
      auth: '/auth',
      users: '/users',
      students: '/students',
      trainers: '/trainers',
      subscriptions: '/subscriptions',
      exercises: '/exercises',
      workouts: '/workouts',
      plans: '/plans',
      payments: '/payments',
      checkins: '/checkins',
      blog: '/blog',
      notifications: '/notifications',
      reports: '/reports',
      health: '/health'
    },
    documentation: process.env.NODE_ENV === 'development' ? '/api/docs' : 'https://api-docs.academia.com',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/subscriptions', subscriptionRoutes);
// Temporarily disabled to isolate issues
// router.use('/users', userRoutes);
// router.use('/students', studentRoutes);
// router.use('/trainers', trainerRoutes);
// router.use('/exercises', exerciseRoutes);
// router.use('/workouts', workoutRoutes);
// router.use('/plans', planRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/checkins', checkinRoutes);
// router.use('/blog', blogRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/reports', reportRoutes);

module.exports = router;