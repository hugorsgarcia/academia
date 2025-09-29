const Checkin = require('../models/Checkin');
const Student = require('../models/Student');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class CheckinController {
  // GET /api/checkins
  async getAllCheckins(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const student_id = req.query.student_id;
      const date = req.query.date;
      const start_date = req.query.start_date;
      const end_date = req.query.end_date;

      let query = Checkin.query()
        .withGraphFetched('student.user')
        .orderBy('checkin_time', 'desc');

      // Apply filters
      if (student_id) {
        query = query.where('student_id', student_id);
      }

      if (date) {
        query = query.whereRaw('DATE(checkin_time) = ?', [date]);
      }

      if (start_date && end_date) {
        query = query.whereBetween('checkin_time', [start_date, end_date]);
      } else if (start_date) {
        query = query.where('checkin_time', '>=', start_date);
      } else if (end_date) {
        query = query.where('checkin_time', '<=', end_date);
      }

      const total = await query.resultSize();
      const checkins = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: checkins.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/:id
  async getCheckin(req, res, next) {
    try {
      const { id } = req.params;

      const checkin = await Checkin.query()
        .findById(id)
        .withGraphFetched('student.user');

      if (!checkin) {
        throw new AppError('Check-in não encontrado', 404);
      }

      res.json({
        success: true,
        data: checkin
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/checkins
  async createCheckin(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { student_id, checkin_method = 'manual' } = req.body;

      // Verify student exists and is active
      const student = await Student.query().findById(student_id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      if (student.status !== 'active') {
        throw new AppError('Aluno não está ativo', 400);
      }

      // Check if student has an active subscription
      const activeSubscription = await student.$relatedQuery('subscriptions')
        .where('status', 'active')
        .where('end_date', '>', new Date())
        .first();

      if (!activeSubscription) {
        throw new AppError('Aluno não possui plano ativo', 400);
      }

      // Check for duplicate checkin today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingCheckin = await Checkin.query()
        .where('student_id', student_id)
        .whereBetween('checkin_time', [today, tomorrow])
        .first();

      if (existingCheckin) {
        throw new AppError('Aluno já fez check-in hoje', 400);
      }

      const checkin = await Checkin.query().insert({
        student_id,
        checkin_time: new Date(),
        checkin_method
      });

      // Fetch complete checkin data
      const completeCheckin = await Checkin.query()
        .findById(checkin.id)
        .withGraphFetched('student.user');

      logger.info(`Check-in created for student: ${student.registration_number}`, {
        checkinId: checkin.id,
        studentId: student_id,
        method: checkin_method
      });

      res.status(201).json({
        success: true,
        message: 'Check-in realizado com sucesso',
        data: completeCheckin
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/checkins/:id/checkout
  async createCheckout(req, res, next) {
    try {
      const { id } = req.params;

      const checkin = await Checkin.query().findById(id);
      if (!checkin) {
        throw new AppError('Check-in não encontrado', 404);
      }

      if (checkin.checkout_time) {
        throw new AppError('Check-out já foi realizado', 400);
      }

      const checkoutTime = new Date();
      const duration = Math.round((checkoutTime - checkin.checkin_time) / (1000 * 60)); // duration in minutes

      const updatedCheckin = await Checkin.query()
        .patchAndFetchById(id, {
          checkout_time: checkoutTime,
          duration_minutes: duration
        })
        .withGraphFetched('student.user');

      logger.info(`Check-out completed for checkin: ${id}`, {
        checkinId: id,
        duration: duration
      });

      res.json({
        success: true,
        message: 'Check-out realizado com sucesso',
        data: updatedCheckin
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/student/:studentId
  async getStudentCheckins(req, res, next) {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const start_date = req.query.start_date;
      const end_date = req.query.end_date;

      const student = await Student.query().findById(studentId);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      let query = Checkin.query()
        .where('student_id', studentId)
        .orderBy('checkin_time', 'desc');

      if (start_date && end_date) {
        query = query.whereBetween('checkin_time', [start_date, end_date]);
      }

      const total = await query.resultSize();
      const checkins = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: checkins.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/today
  async getTodayCheckins(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkins = await Checkin.query()
        .whereBetween('checkin_time', [today, tomorrow])
        .withGraphFetched('student.user')
        .orderBy('checkin_time', 'desc');

      res.json({
        success: true,
        data: checkins
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/active
  async getActiveCheckins(req, res, next) {
    try {
      const activeCheckins = await Checkin.query()
        .whereNull('checkout_time')
        .withGraphFetched('student.user')
        .orderBy('checkin_time', 'desc');

      res.json({
        success: true,
        data: activeCheckins
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/stats
  async getCheckinStats(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's stats
      const todayTotal = await Checkin.query()
        .whereBetween('checkin_time', [today, tomorrow])
        .count('* as count')
        .first();

      const todayActive = await Checkin.query()
        .whereBetween('checkin_time', [today, tomorrow])
        .whereNull('checkout_time')
        .count('* as count')
        .first();

      // Weekly stats (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const weeklyCheckins = await Checkin.query()
        .select(Checkin.raw('DATE(checkin_time) as date'))
        .count('* as count')
        .whereBetween('checkin_time', [weekAgo, tomorrow])
        .groupByRaw('DATE(checkin_time)')
        .orderBy('date');

      // Monthly stats (current month)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const monthlyTotal = await Checkin.query()
        .whereBetween('checkin_time', [monthStart, monthEnd])
        .count('* as count')
        .first();

      // Average duration
      const avgDuration = await Checkin.query()
        .whereNotNull('duration_minutes')
        .whereBetween('checkin_time', [weekAgo, tomorrow])
        .avg('duration_minutes as avg_duration')
        .first();

      // Peak hours
      const peakHours = await Checkin.query()
        .select(Checkin.raw('HOUR(checkin_time) as hour'))
        .count('* as count')
        .whereBetween('checkin_time', [weekAgo, tomorrow])
        .groupByRaw('HOUR(checkin_time)')
        .orderBy('count', 'desc')
        .limit(5);

      // Most frequent visitors
      const frequentVisitors = await Checkin.query()
        .select('student_id')
        .count('* as visits')
        .join('students', 'checkins.student_id', 'students.id')
        .join('users', 'students.user_id', 'users.id')
        .select('users.name as student_name', 'students.registration_number')
        .whereBetween('checkin_time', [monthStart, monthEnd])
        .groupBy('student_id', 'users.name', 'students.registration_number')
        .orderBy('visits', 'desc')
        .limit(10);

      res.json({
        success: true,
        data: {
          today: {
            total: parseInt(todayTotal.count),
            active: parseInt(todayActive.count)
          },
          monthly: {
            total: parseInt(monthlyTotal.count)
          },
          weekly: weeklyCheckins,
          averageDuration: Math.round(parseFloat(avgDuration.avg_duration) || 0),
          peakHours,
          frequentVisitors
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/checkins/report
  async getCheckinReport(req, res, next) {
    try {
      const { start_date, end_date, student_id } = req.query;

      if (!start_date || !end_date) {
        throw new AppError('Datas de início e fim são obrigatórias', 400);
      }

      let query = Checkin.query()
        .withGraphFetched('student.user')
        .whereBetween('checkin_time', [start_date, end_date])
        .orderBy('checkin_time', 'desc');

      if (student_id) {
        query = query.where('student_id', student_id);
      }

      const checkins = await query;

      // Calculate summary statistics
      const totalCheckins = checkins.length;
      const uniqueStudents = new Set(checkins.map(c => c.student_id)).size;
      const averageDuration = checkins
        .filter(c => c.duration_minutes)
        .reduce((sum, c) => sum + c.duration_minutes, 0) / 
        checkins.filter(c => c.duration_minutes).length || 0;

      // Daily breakdown
      const dailyBreakdown = {};
      checkins.forEach(checkin => {
        const date = checkin.checkin_time.toISOString().split('T')[0];
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = 0;
        }
        dailyBreakdown[date]++;
      });

      res.json({
        success: true,
        data: {
          checkins,
          summary: {
            totalCheckins,
            uniqueStudents,
            averageDuration: Math.round(averageDuration),
            dailyBreakdown
          },
          period: {
            start_date,
            end_date
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/checkins/:id
  async deleteCheckin(req, res, next) {
    try {
      const { id } = req.params;

      const checkin = await Checkin.query().findById(id);
      if (!checkin) {
        throw new AppError('Check-in não encontrado', 404);
      }

      await Checkin.query().deleteById(id);

      logger.info(`Check-in deleted: ${id}`, {
        checkinId: id,
        deletedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Check-in excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckinController();