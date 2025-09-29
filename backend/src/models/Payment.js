const { Model } = require('objection');

class Payment extends Model {
  static get tableName() {
    return 'payments';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'amount'],
      properties: {
        id: { type: 'integer' },
        student_id: { type: 'integer' },
        subscription_id: { type: 'integer' },
        amount: { type: 'number' },
        discount_amount: { type: 'number', default: 0 },
        final_amount: { type: 'number' },
        currency: { type: 'string', default: 'BRL' },
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded'],
          default: 'pending'
        },
        payment_method: {
          type: 'string',
          enum: ['credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'check'],
          default: 'credit_card'
        },
        payment_data: { type: 'object' },
        transaction_id: { type: 'string' },
        external_id: { type: 'string' },
        due_date: { type: 'string', format: 'date-time' },
        paid_at: { type: 'string', format: 'date-time' },
        confirmed_by: { type: 'integer' },
        notes: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Student = require('./Student');
    const Subscription = require('./Subscription');
    const User = require('./User');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: Student,
        join: {
          from: 'payments.student_id',
          to: 'students.id'
        }
      },
      subscription: {
        relation: Model.BelongsToOneRelation,
        modelClass: Subscription,
        join: {
          from: 'payments.subscription_id',
          to: 'subscriptions.id'
        }
      },
      confirmedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'payments.confirmed_by',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Calculate final amount if not provided
    if (!this.final_amount) {
      this.final_amount = this.amount - (this.discount_amount || 0);
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Virtual properties
  get isPaid() {
    return this.status === 'paid';
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isOverdue() {
    if (this.isPaid) return false;
    return new Date() > new Date(this.due_date);
  }

  get daysPastDue() {
    if (!this.isOverdue) return 0;
    const now = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = now - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysUntilDue() {
    if (this.isPaid) return null;
    const now = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = dueDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get discountPercentage() {
    if (!this.amount || !this.discount_amount) return 0;
    return Math.round((this.discount_amount / this.amount) * 100);
  }

  get formattedAmount() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency || 'BRL'
    }).format(this.amount);
  }

  get formattedFinalAmount() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency || 'BRL'
    }).format(this.final_amount);
  }

  get paymentMethodFormatted() {
    const methods = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      bank_transfer: 'Transferência Bancária',
      cash: 'Dinheiro',
      check: 'Cheque'
    };
    return methods[this.payment_method] || this.payment_method;
  }

  get statusFormatted() {
    const statuses = {
      pending: 'Pendente',
      processing: 'Processando',
      paid: 'Pago',
      failed: 'Falhou',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statuses[this.status] || this.status;
  }

  // Instance methods
  async markAsPaid(transactionId = null, confirmedBy = null) {
    if (this.isPaid) {
      throw new Error('Pagamento já foi confirmado');
    }

    return await this.$query().patch({
      status: 'paid',
      paid_at: new Date().toISOString(),
      transaction_id: transactionId || this.transaction_id,
      confirmed_by: confirmedBy
    });
  }

  async markAsFailed(reason = null) {
    return await this.$query().patch({
      status: 'failed',
      notes: reason ? `${this.notes || ''}\nFalha: ${reason}` : this.notes
    });
  }

  async cancel(reason = null) {
    if (this.isPaid) {
      throw new Error('Não é possível cancelar pagamento já confirmado');
    }

    return await this.$query().patch({
      status: 'cancelled',
      notes: reason ? `${this.notes || ''}\nCancelado: ${reason}` : this.notes
    });
  }

  async refund(amount = null, reason = null) {
    if (!this.isPaid) {
      throw new Error('Só é possível reembolsar pagamentos confirmados');
    }

    const refundAmount = amount || this.final_amount;

    return await this.$query().patch({
      status: 'refunded',
      notes: reason ? `${this.notes || ''}\nReembolsado (${refundAmount}): ${reason}` : this.notes
    });
  }

  async applyDiscount(discountAmount, reason = null) {
    if (this.isPaid) {
      throw new Error('Não é possível aplicar desconto em pagamento já confirmado');
    }

    const newFinalAmount = this.amount - discountAmount;
    if (newFinalAmount < 0) {
      throw new Error('Desconto não pode ser maior que o valor do pagamento');
    }

    return await this.$query().patch({
      discount_amount: discountAmount,
      final_amount: newFinalAmount,
      notes: reason ? `${this.notes || ''}\nDesconto aplicado: ${reason}` : this.notes
    });
  }

  // Static methods
  static findByStudent(studentId) {
    return this.query()
      .where('student_id', studentId)
      .withGraphFetched('[subscription.plan]')
      .orderBy('created_at', 'desc');
  }

  static findBySubscription(subscriptionId) {
    return this.query()
      .where('subscription_id', subscriptionId)
      .orderBy('created_at', 'desc');
  }

  static findPending() {
    return this.query()
      .where('status', 'pending')
      .withGraphFetched('[student.user, subscription.plan]')
      .orderBy('due_date', 'asc');
  }

  static findOverdue() {
    return this.query()
      .where('status', 'pending')
      .where('due_date', '<', new Date().toISOString())
      .withGraphFetched('[student.user, subscription.plan]')
      .orderBy('due_date', 'asc');
  }

  static findPaid(startDate = null, endDate = null) {
    let query = this.query()
      .where('status', 'paid')
      .withGraphFetched('[student.user, subscription.plan]')
      .orderBy('paid_at', 'desc');

    if (startDate && endDate) {
      query = query.whereBetween('paid_at', [startDate, endDate]);
    } else if (startDate) {
      query = query.where('paid_at', '>=', startDate);
    } else if (endDate) {
      query = query.where('paid_at', '<=', endDate);
    }

    return query;
  }

  static async getPaymentStats(startDate = null, endDate = null) {
    let baseQuery = this.query();
    
    if (startDate && endDate) {
      baseQuery = baseQuery.whereBetween('created_at', [startDate, endDate]);
    }

    const total = await baseQuery.clone().count('* as count').first();
    const paid = await baseQuery.clone().where('status', 'paid').count('* as count').first();
    const pending = await baseQuery.clone().where('status', 'pending').count('* as count').first();
    const overdue = await this.query()
      .where('status', 'pending')
      .where('due_date', '<', new Date().toISOString())
      .count('* as count')
      .first();

    // Revenue stats
    const totalRevenue = await baseQuery.clone()
      .where('status', 'paid')
      .sum('final_amount as total')
      .first();

    const pendingRevenue = await baseQuery.clone()
      .where('status', 'pending')
      .sum('final_amount as total')
      .first();

    // Payment methods breakdown
    const byPaymentMethod = await baseQuery.clone()
      .select('payment_method')
      .count('* as count')
      .sum('final_amount as total_amount')
      .where('status', 'paid')
      .groupBy('payment_method')
      .orderBy('count', 'desc');

    // Monthly revenue
    const monthlyRevenue = await this.query()
      .select(this.raw('MONTH(paid_at) as month'), this.raw('YEAR(paid_at) as year'))
      .sum('final_amount as revenue')
      .count('* as transactions')
      .where('status', 'paid')
      .whereNotNull('paid_at')
      .groupByRaw('YEAR(paid_at), MONTH(paid_at)')
      .orderByRaw('YEAR(paid_at) DESC, MONTH(paid_at) DESC')
      .limit(12);

    return {
      counts: {
        total: parseInt(total.count),
        paid: parseInt(paid.count),
        pending: parseInt(pending.count),
        overdue: parseInt(overdue.count)
      },
      revenue: {
        total: parseFloat(totalRevenue.total) || 0,
        pending: parseFloat(pendingRevenue.total) || 0,
        monthly: monthlyRevenue
      },
      byPaymentMethod
    };
  }

  static async getRevenueReport(startDate, endDate, groupBy = 'day') {
    let dateFormat, groupByClause;

    switch (groupBy) {
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

    const revenueData = await this.query()
      .select(this.raw(`${dateFormat} as period`))
      .sum('final_amount as revenue')
      .count('* as transactions')
      .where('status', 'paid')
      .whereBetween('paid_at', [startDate, endDate])
      .groupByRaw(groupByClause)
      .orderBy('period');

    const summary = revenueData.reduce((acc, item) => ({
      totalRevenue: acc.totalRevenue + parseFloat(item.revenue),
      totalTransactions: acc.totalTransactions + parseInt(item.transactions)
    }), { totalRevenue: 0, totalTransactions: 0 });

    return {
      data: revenueData,
      summary: {
        ...summary,
        averageTransaction: summary.totalTransactions > 0 ? 
          summary.totalRevenue / summary.totalTransactions : 0
      },
      period: { startDate, endDate, groupBy }
    };
  }

  static async processOverduePayments() {
    const overduePayments = await this.findOverdue();
    
    // Here you could implement automatic actions like:
    // - Send overdue notifications
    // - Apply late fees
    // - Suspend subscriptions
    
    return overduePayments.map(payment => ({
      id: payment.id,
      studentId: payment.student_id,
      daysPastDue: payment.daysPastDue,
      amount: payment.final_amount
    }));
  }

  static async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const lastPayment = await this.query()
      .whereRaw(`DATE_FORMAT(created_at, '%Y-%m') = ?`, [`${year}-${month}`])
      .orderBy('id', 'desc')
      .first();

    let sequence = 1;
    if (lastPayment && lastPayment.external_id) {
      const lastSequence = parseInt(lastPayment.external_id.split('-').pop());
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

module.exports = Payment;