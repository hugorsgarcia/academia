const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Subscription = require('../models/Subscription');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class PaymentController {
  // GET /api/payments
  async getAllPayments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const student_id = req.query.student_id;
      const subscription_id = req.query.subscription_id;
      const status = req.query.status;
      const payment_method = req.query.payment_method;
      const start_date = req.query.start_date;
      const end_date = req.query.end_date;

      let query = Payment.query()
        .withGraphFetched('[student.user, subscription.plan]')
        .orderBy('created_at', 'desc');

      // Apply filters
      if (student_id) {
        query = query.where('student_id', student_id);
      }

      if (subscription_id) {
        query = query.where('subscription_id', subscription_id);
      }

      if (status) {
        query = query.where('status', status);
      }

      if (payment_method) {
        query = query.where('payment_method', payment_method);
      }

      if (start_date && end_date) {
        query = query.whereBetween('created_at', [start_date, end_date]);
      } else if (start_date) {
        query = query.where('created_at', '>=', start_date);
      } else if (end_date) {
        query = query.where('created_at', '<=', end_date);
      }

      const total = await query.resultSize();
      const payments = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: payments.results,
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

  // GET /api/payments/:id
  async getPayment(req, res, next) {
    try {
      const { id } = req.params;

      const payment = await Payment.query()
        .findById(id)
        .withGraphFetched('[student.user, subscription.plan]');

      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payments
  async createPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const {
        student_id,
        subscription_id,
        amount,
        payment_method,
        payment_data,
        due_date,
        notes
      } = req.body;

      // Verify student exists
      const student = await Student.query().findById(student_id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Verify subscription exists if provided
      if (subscription_id) {
        const subscription = await Subscription.query().findById(subscription_id);
        if (!subscription) {
          throw new AppError('Assinatura não encontrada', 404);
        }
        if (subscription.student_id !== student_id) {
          throw new AppError('Assinatura não pertence ao aluno informado', 400);
        }
      }

      const paymentData = {
        student_id,
        subscription_id,
        amount,
        payment_method,
        payment_data: payment_data || null,
        due_date: due_date || new Date(),
        notes: notes || null,
        status: 'pending',
        created_by: req.user.id
      };

      const payment = await Payment.query().insert(paymentData);

      // Fetch complete payment
      const completePayment = await Payment.query()
        .findById(payment.id)
        .withGraphFetched('[student.user, subscription.plan]');

      logger.info(`Payment created for student: ${student_id}`, {
        paymentId: payment.id,
        studentId: student_id,
        amount,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso',
        data: completePayment
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/payments/:id
  async updatePayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const payment = await Payment.query().findById(id);
      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      const updatedPayment = await Payment.query()
        .patchAndFetchById(id, updateData)
        .withGraphFetched('[student.user, subscription.plan]');

      logger.info(`Payment updated: ${id}`, {
        paymentId: id,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Pagamento atualizado com sucesso',
        data: updatedPayment
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/payments/:id/confirm
  async confirmPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { transaction_id, payment_data } = req.body;

      const payment = await Payment.query().findById(id);
      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      if (payment.status === 'paid') {
        throw new AppError('Pagamento já foi confirmado', 400);
      }

      const updatedPayment = await Payment.query()
        .patchAndFetchById(id, {
          status: 'paid',
          paid_at: new Date(),
          transaction_id: transaction_id || null,
          payment_data: payment_data ? { ...payment.payment_data, ...payment_data } : payment.payment_data,
          confirmed_by: req.user.id
        })
        .withGraphFetched('[student.user, subscription.plan]');

      // Update subscription status if applicable
      if (payment.subscription_id) {
        await Subscription.query()
          .findById(payment.subscription_id)
          .patch({ status: 'active' });
      }

      logger.info(`Payment confirmed: ${id}`, {
        paymentId: id,
        amount: updatedPayment.amount,
        confirmedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        data: updatedPayment
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/payments/:id/cancel
  async cancelPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await Payment.query().findById(id);
      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      if (payment.status === 'paid') {
        throw new AppError('Não é possível cancelar pagamento já confirmado', 400);
      }

      const updatedPayment = await Payment.query()
        .patchAndFetchById(id, {
          status: 'cancelled',
          notes: reason ? `${payment.notes || ''}\nCancelado: ${reason}` : payment.notes,
          cancelled_by: req.user.id,
          cancelled_at: new Date()
        })
        .withGraphFetched('[student.user, subscription.plan]');

      logger.info(`Payment cancelled: ${id}`, {
        paymentId: id,
        reason,
        cancelledBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Pagamento cancelado com sucesso',
        data: updatedPayment
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments/student/:studentId
  async getStudentPayments(req, res, next) {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;

      const student = await Student.query().findById(studentId);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      let query = Payment.query()
        .where('student_id', studentId)
        .withGraphFetched('subscription.plan')
        .orderBy('created_at', 'desc');

      if (status) {
        query = query.where('status', status);
      }

      const total = await query.resultSize();
      const payments = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: payments.results,
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

  // GET /api/payments/overdue
  async getOverduePayments(req, res, next) {
    try {
      const today = new Date();
      
      const overduePayments = await Payment.query()
        .where('status', 'pending')
        .where('due_date', '<', today)
        .withGraphFetched('[student.user, subscription.plan]')
        .orderBy('due_date', 'asc');

      res.json({
        success: true,
        data: overduePayments
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments/pending
  async getPendingPayments(req, res, next) {
    try {
      const pendingPayments = await Payment.query()
        .where('status', 'pending')
        .withGraphFetched('[student.user, subscription.plan]')
        .orderBy('due_date', 'asc');

      res.json({
        success: true,
        data: pendingPayments
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments/stats
  async getPaymentStats(req, res, next) {
    try {
      const total = await Payment.query().count('* as count').first();
      const paid = await Payment.query().where('status', 'paid').count('* as count').first();
      const pending = await Payment.query().where('status', 'pending').count('* as count').first();
      const cancelled = await Payment.query().where('status', 'cancelled').count('* as count').first();
      const overdue = await Payment.query()
        .where('status', 'pending')
        .where('due_date', '<', new Date())
        .count('* as count')
        .first();

      // Revenue stats
      const totalRevenue = await Payment.query()
        .where('status', 'paid')
        .sum('amount as total')
        .first();

      const monthlyRevenue = await Payment.query()
        .select(Payment.raw('MONTH(paid_at) as month'), Payment.raw('YEAR(paid_at) as year'))
        .sum('amount as revenue')
        .where('status', 'paid')
        .whereNotNull('paid_at')
        .groupByRaw('YEAR(paid_at), MONTH(paid_at)')
        .orderByRaw('YEAR(paid_at) DESC, MONTH(paid_at) DESC')
        .limit(12);

      // Payment methods breakdown
      const byPaymentMethod = await Payment.query()
        .select('payment_method')
        .count('* as count')
        .sum('amount as total_amount')
        .where('status', 'paid')
        .groupBy('payment_method')
        .orderBy('count', 'desc');

      // Daily revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyRevenue = await Payment.query()
        .select(Payment.raw('DATE(paid_at) as date'))
        .sum('amount as revenue')
        .count('* as transactions')
        .where('status', 'paid')
        .where('paid_at', '>=', thirtyDaysAgo)
        .groupByRaw('DATE(paid_at)')
        .orderBy('date');

      // Average payment value
      const avgPayment = await Payment.query()
        .where('status', 'paid')
        .avg('amount as avg_amount')
        .first();

      res.json({
        success: true,
        data: {
          counts: {
            total: parseInt(total.count),
            paid: parseInt(paid.count),
            pending: parseInt(pending.count),
            cancelled: parseInt(cancelled.count),
            overdue: parseInt(overdue.count)
          },
          revenue: {
            total: parseFloat(totalRevenue.total) || 0,
            monthly: monthlyRevenue,
            daily: dailyRevenue,
            average: parseFloat(avgPayment.avg_amount) || 0
          },
          byPaymentMethod,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments/revenue
  async getRevenueReport(req, res, next) {
    try {
      const { start_date, end_date, group_by = 'day' } = req.query;

      if (!start_date || !end_date) {
        throw new AppError('Datas de início e fim são obrigatórias', 400);
      }

      let dateFormat;
      let groupByClause;

      switch (group_by) {
        case 'day':
          dateFormat = 'DATE(paid_at)';
          groupByClause = 'DATE(paid_at)';
          break;
        case 'month':
          dateFormat = 'DATE_FORMAT(paid_at, "%Y-%m")';
          groupByClause = 'YEAR(paid_at), MONTH(paid_at)';
          break;
        case 'year':
          dateFormat = 'YEAR(paid_at)';
          groupByClause = 'YEAR(paid_at)';
          break;
        default:
          dateFormat = 'DATE(paid_at)';
          groupByClause = 'DATE(paid_at)';
      }

      const revenueData = await Payment.query()
        .select(Payment.raw(`${dateFormat} as period`))
        .sum('amount as revenue')
        .count('* as transactions')
        .where('status', 'paid')
        .whereBetween('paid_at', [start_date, end_date])
        .groupByRaw(groupByClause)
        .orderBy('period');

      const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
      const totalTransactions = revenueData.reduce((sum, item) => sum + parseInt(item.transactions), 0);

      res.json({
        success: true,
        data: {
          revenueData,
          summary: {
            totalRevenue,
            totalTransactions,
            averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
          },
          period: {
            start_date,
            end_date,
            group_by
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payments/bulk
  async createBulkPayments(req, res, next) {
    try {
      const { payments } = req.body;

      if (!Array.isArray(payments) || payments.length === 0) {
        throw new AppError('Lista de pagamentos é obrigatória', 400);
      }

      const paymentsToCreate = payments.map(payment => ({
        ...payment,
        status: 'pending',
        created_by: req.user.id
      }));

      const createdPayments = await Payment.query().insert(paymentsToCreate);

      logger.info(`Bulk payments created: ${createdPayments.length} payments`, {
        count: createdPayments.length,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: `${createdPayments.length} pagamentos criados com sucesso`,
        data: createdPayments
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/payments/:id
  async deletePayment(req, res, next) {
    try {
      const { id } = req.params;

      const payment = await Payment.query().findById(id);
      if (!payment) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      if (payment.status === 'paid') {
        throw new AppError('Não é possível excluir pagamento já confirmado', 400);
      }

      await Payment.query().deleteById(id);

      logger.info(`Payment deleted: ${id}`, {
        paymentId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Pagamento excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();