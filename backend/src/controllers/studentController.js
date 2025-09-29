const Student = require('../models/Student');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class StudentController {
  // GET /api/students
  async getAllStudents(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const search = req.query.search;

      let query = Student.query()
        .withGraphFetched('[user, subscriptions.[plan]]')
        .orderBy('created_at', 'desc');

      // Filter by status
      if (status) {
        query = query.where('status', status);
      }

      // Search functionality
      if (search) {
        query = query.where(builder => {
          builder
            .where('registration_number', 'like', `%${search}%`)
            .orWhere('cpf', 'like', `%${search}%`)
            .orWhereExists(
              User.query()
                .select(1)
                .where('users.id', 'students.user_id')
                .where(subBuilder => {
                  subBuilder
                    .where('name', 'like', `%${search}%`)
                    .orWhere('email', 'like', `%${search}%`);
                })
            );
        });
      }

      const total = await query.resultSize();
      const students = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: students.results,
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

  // GET /api/students/:id
  async getStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query()
        .findById(id)
        .withGraphFetched(`[
          user,
          subscriptions.[plan],
          workouts.[exercises, trainer.user],
          checkins(orderByDate)
        ]`)
        .modifiers({
          orderByDate: builder => builder.orderBy('checkin_time', 'desc').limit(10)
        });

      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/students
  async createStudent(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const {
        name,
        email,
        password,
        phone,
        cpf,
        birth_date,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        medical_conditions,
        fitness_goals,
        body_measurements,
        preferences
      } = req.body;

      // Generate registration number
      const registrationNumber = await this.generateRegistrationNumber();

      // Create user first
      const user = await User.query().insert({
        name,
        email,
        password,
        role: 'student',
        phone
      });

      // Create student
      const student = await Student.query().insert({
        user_id: user.id,
        registration_number: registrationNumber,
        cpf,
        birth_date,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        medical_conditions,
        fitness_goals,
        body_measurements,
        preferences,
        status: 'active',
        enrollment_date: new Date()
      });

      // Fetch the complete student data
      const completeStudent = await Student.query()
        .findById(student.id)
        .withGraphFetched('user');

      logger.info(`Student created: ${completeStudent.registration_number}`, {
        studentId: student.id,
        userId: user.id
      });

      res.status(201).json({
        success: true,
        message: 'Aluno cadastrado com sucesso',
        data: completeStudent
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/students/:id
  async updateStudent(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.query().findById(id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Separate user data from student data
      const { name, email, phone: userPhone, ...studentData } = updateData;
      
      // Update user data if provided
      if (name || email || userPhone) {
        await User.query()
          .findById(student.user_id)
          .patch({
            ...(name && { name }),
            ...(email && { email }),
            ...(userPhone && { phone: userPhone })
          });
      }

      // Update student data
      const updatedStudent = await Student.query()
        .patchAndFetchById(id, studentData)
        .withGraphFetched('user');

      logger.info(`Student updated: ${updatedStudent.registration_number}`, {
        studentId: id
      });

      res.json({
        success: true,
        message: 'Aluno atualizado com sucesso',
        data: updatedStudent
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/students/:id
  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query().findById(id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Soft delete - change status to inactive instead of deleting
      await Student.query()
        .findById(id)
        .patch({ status: 'inactive' });

      logger.info(`Student deactivated: ${student.registration_number}`, {
        studentId: id
      });

      res.json({
        success: true,
        message: 'Aluno desativado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/:id/subscriptions
  async getStudentSubscriptions(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query().findById(id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const subscriptions = await student.$relatedQuery('subscriptions')
        .withGraphFetched('plan')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/:id/workouts
  async getStudentWorkouts(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query().findById(id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const workouts = await student.$relatedQuery('workouts')
        .withGraphFetched('[exercises, trainer.user]')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: workouts
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/:id/checkins
  async getStudentCheckins(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const student = await Student.query().findById(id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const checkins = await student.$relatedQuery('checkins')
        .orderBy('checkin_time', 'desc')
        .page(page - 1, limit);

      res.json({
        success: true,
        data: checkins.results,
        pagination: {
          page,
          limit,
          total: checkins.total,
          pages: Math.ceil(checkins.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/stats
  async getStudentsStats(req, res, next) {
    try {
      const total = await Student.query().count('* as count').first();
      const active = await Student.query().where('status', 'active').count('* as count').first();
      const inactive = await Student.query().where('status', 'inactive').count('* as count').first();
      const pending = await Student.query().where('status', 'pending').count('* as count').first();

      // Monthly enrollment stats
      const currentYear = new Date().getFullYear();
      const monthlyEnrollments = await Student.query()
        .select(Student.raw('MONTH(enrollment_date) as month'), Student.raw('COUNT(*) as count'))
        .whereRaw('YEAR(enrollment_date) = ?', [currentYear])
        .groupByRaw('MONTH(enrollment_date)')
        .orderBy('month');

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          active: parseInt(active.count),
          inactive: parseInt(inactive.count),
          pending: parseInt(pending.count),
          monthlyEnrollments
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentPayments(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const payments = await Payment.query()
        .where('student_id', id)
        .withGraphFetched('[subscription.[plan]]')
        .orderBy('created_at', 'desc')
        .page(offset / limit, limit);

      res.json({
        status: 'success',
        data: {
          payments: payments.results,
          pagination: {
            page,
            limit,
            total: payments.total
          }
        }
      });
    } catch (error) {
      logger.error('Get student payments error:', error);
      next(error);
    }
  }

  async activateStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query()
        .findById(id)
        .patch({ status: 'active' })
        .returning('*');

      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      logger.info(`Student activated: ${id}`, { studentId: id });

      res.json({
        status: 'success',
        message: 'Student activated successfully',
        data: { student }
      });
    } catch (error) {
      logger.error('Activate student error:', error);
      next(error);
    }
  }

  async deactivateStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query()
        .findById(id)
        .patch({ status: 'inactive' })
        .returning('*');

      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      logger.info(`Student deactivated: ${id}`, { studentId: id });

      res.json({
        status: 'success',
        message: 'Student deactivated successfully',
        data: { student }
      });
    } catch (error) {
      logger.error('Deactivate student error:', error);
      next(error);
    }
  }

  async bulkCreateStudents(req, res, next) {
    try {
      const { students } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        return next(new AppError('Students array is required', 400));
      }

      const createdStudents = [];
      const errors = [];

      for (let i = 0; i < students.length; i++) {
        try {
          const studentData = students[i];
          
          // Generate registration number
          const registrationNumber = await this.generateRegistrationNumber();
          
          const student = await Student.query().insert({
            ...studentData,
            registrationNumber,
            status: 'active'
          });

          createdStudents.push(student);
        } catch (error) {
          errors.push({
            index: i,
            error: error.message,
            data: students[i]
          });
        }
      }

      logger.info(`Bulk created students: ${createdStudents.length}, errors: ${errors.length}`);

      res.status(201).json({
        status: 'success',
        message: `${createdStudents.length} students created successfully`,
        data: {
          students: createdStudents,
          errors
        }
      });
    } catch (error) {
      logger.error('Bulk create students error:', error);
      next(error);
    }
  }

  async assignPlan(req, res, next) {
    try {
      const { id } = req.params;
      const { plan_id } = req.body;

      const student = await Student.query().findById(id);
      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      // Create subscription (assuming Subscription model exists)
      const subscription = await Subscription.query().insert({
        studentId: id,
        planId: plan_id,
        status: 'active',
        startDate: new Date()
      });

      logger.info(`Plan assigned to student: ${id}`, { studentId: id, planId: plan_id });

      res.json({
        status: 'success',
        message: 'Plan assigned successfully',
        data: { subscription }
      });
    } catch (error) {
      logger.error('Assign plan error:', error);
      next(error);
    }
  }

  async suspendStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const student = await Student.query()
        .findById(id)
        .patch({ 
          status: 'suspended',
          suspensionReason: reason || 'No reason provided'
        })
        .returning('*');

      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      logger.info(`Student suspended: ${id}`, { studentId: id, reason });

      res.json({
        status: 'success',
        message: 'Student suspended successfully',
        data: { student }
      });
    } catch (error) {
      logger.error('Suspend student error:', error);
      next(error);
    }
  }

  async reactivateStudent(req, res, next) {
    try {
      const { id } = req.params;

      const student = await Student.query()
        .findById(id)
        .patch({ 
          status: 'active',
          suspensionReason: null
        })
        .returning('*');

      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      logger.info(`Student reactivated: ${id}`, { studentId: id });

      res.json({
        status: 'success',
        message: 'Student reactivated successfully',
        data: { student }
      });
    } catch (error) {
      logger.error('Reactivate student error:', error);
      next(error);
    }
  }

  async updateStudentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const student = await Student.query()
        .findById(id)
        .patch({ status })
        .returning('*');

      if (!student) {
        return next(new AppError('Student not found', 404));
      }

      logger.info(`Student status updated: ${id}`, { studentId: id, status });

      res.json({
        status: 'success',
        message: 'Student status updated successfully',
        data: { student }
      });
    } catch (error) {
      logger.error('Update student status error:', error);
      next(error);
    }
  }

  // Helper method to generate registration number
  async generateRegistrationNumber() {
    const year = new Date().getFullYear();
    const lastStudent = await Student.query()
      .where('registration_number', 'like', `${year}%`)
      .orderBy('registration_number', 'desc')
      .first();

    if (lastStudent) {
      const lastNumber = parseInt(lastStudent.registration_number.slice(-4));
      return `${year}${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      return `${year}0001`;
    }
  }
}

module.exports = new StudentController();