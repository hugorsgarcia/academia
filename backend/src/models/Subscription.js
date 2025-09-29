const { Model } = require('objection');

class Subscription extends Model {
  static get tableName() {
    return 'subscriptions';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'plan_id', 'start_date', 'end_date'],
      properties: {
        id: { type: 'integer' },
        student_id: { type: 'integer' },
        plan_id: { type: 'integer' },
        start_date: { type: 'string', format: 'date-time' },
        end_date: { type: 'string', format: 'date-time' },
        price: { type: 'number' },
        discount_amount: { type: 'number', default: 0 },
        final_price: { type: 'number' },
        status: { 
          type: 'string', 
          enum: ['pending', 'active', 'expired', 'cancelled', 'suspended'],
          default: 'pending'
        },
        auto_renew: { type: 'boolean', default: false },
        payment_method: { type: 'string' },
        notes: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Student = require('./Student');
    const Plan = require('./Plan');
    const Payment = require('./Payment');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: Student,
        join: {
          from: 'subscriptions.student_id',
          to: 'students.id'
        }
      },
      plan: {
        relation: Model.BelongsToOneRelation,
        modelClass: Plan,
        join: {
          from: 'subscriptions.plan_id',
          to: 'plans.id'
        }
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'subscriptions.id',
          to: 'payments.subscription_id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Virtual properties
  get isActive() {
    return this.status === 'active' && new Date() <= new Date(this.end_date);
  }

  get isExpired() {
    return new Date() > new Date(this.end_date);
  }

  get daysRemaining() {
    if (this.isExpired) return 0;
    const now = new Date();
    const endDate = new Date(this.end_date);
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get durationInDays() {
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    const diffTime = endDate - startDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get totalSavings() {
    return this.discount_amount || 0;
  }

  get discountPercentage() {
    if (!this.price || !this.discount_amount) return 0;
    return Math.round((this.discount_amount / this.price) * 100);
  }

  // Instance methods
  async extend(days) {
    const currentEndDate = new Date(this.end_date);
    const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return await this.$query().patch({
      end_date: newEndDate.toISOString()
    });
  }

  async suspend(reason) {
    return await this.$query().patch({
      status: 'suspended',
      notes: reason ? `${this.notes || ''}\nSuspenso: ${reason}` : this.notes
    });
  }

  async reactivate() {
    if (this.isExpired) {
      throw new Error('Cannot reactivate expired subscription');
    }
    
    return await this.$query().patch({
      status: 'active'
    });
  }

  async cancel(reason) {
    return await this.$query().patch({
      status: 'cancelled',
      auto_renew: false,
      notes: reason ? `${this.notes || ''}\nCancelado: ${reason}` : this.notes
    });
  }

  // Check if subscription needs renewal
  needsRenewal(daysBeforeExpiry = 7) {
    return this.daysRemaining <= daysBeforeExpiry && this.daysRemaining > 0;
  }

  // Static methods
  static findActive() {
    return this.query()
      .where('status', 'active')
      .where('end_date', '>', new Date().toISOString())
      .withGraphFetched('[student.user, plan]')
      .orderBy('end_date', 'asc');
  }

  static findExpired() {
    return this.query()
      .where('end_date', '<', new Date().toISOString())
      .whereIn('status', ['active', 'pending'])
      .withGraphFetched('[student.user, plan]')
      .orderBy('end_date', 'desc');
  }

  static findExpiringSoon(days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.query()
      .where('status', 'active')
      .whereBetween('end_date', [new Date().toISOString(), futureDate.toISOString()])
      .withGraphFetched('[student.user, plan]')
      .orderBy('end_date', 'asc');
  }

  static findByStudent(studentId) {
    return this.query()
      .where('student_id', studentId)
      .withGraphFetched('plan')
      .orderBy('created_at', 'desc');
  }

  static findByPlan(planId) {
    return this.query()
      .where('plan_id', planId)
      .withGraphFetched('[student.user, plan]')
      .orderBy('created_at', 'desc');
  }

  static async getSubscriptionStats() {
    const total = await this.query().count('* as count').first();
    const active = await this.query().where('status', 'active').count('* as count').first();
    const expired = await this.query()
      .where('end_date', '<', new Date().toISOString())
      .count('* as count')
      .first();
    const expiringSoon = await this.query()
      .where('status', 'active')
      .where('end_date', '>', new Date().toISOString())
      .where('end_date', '<', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .count('* as count')
      .first();

    // Revenue statistics
    const totalRevenue = await this.query()
      .sum('final_price as total')
      .where('status', 'active')
      .first();

    // Monthly subscription stats
    const monthlyStats = await this.query()
      .select(this.raw('MONTH(start_date) as month'), this.raw('YEAR(start_date) as year'))
      .count('* as count')
      .sum('final_price as revenue')
      .where('status', 'active')
      .groupByRaw('YEAR(start_date), MONTH(start_date)')
      .orderByRaw('YEAR(start_date) DESC, MONTH(start_date) DESC')
      .limit(12);

    return {
      total: parseInt(total.count),
      active: parseInt(active.count),
      expired: parseInt(expired.count),
      expiringSoon: parseInt(expiringSoon.count),
      totalRevenue: parseFloat(totalRevenue.total) || 0,
      monthlyStats
    };
  }

  static async updateExpiredSubscriptions() {
    const expiredCount = await this.query()
      .where('end_date', '<', new Date().toISOString())
      .whereIn('status', ['active', 'pending'])
      .patch({ status: 'expired' });

    return expiredCount;
  }

  // Auto-renewal logic
  static async processAutoRenewals() {
    const subscriptionsToRenew = await this.query()
      .where('auto_renew', true)
      .where('status', 'active')
      .where('end_date', '<', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Next 24 hours
      .withGraphFetched('[student, plan]');

    const renewalResults = [];

    for (const subscription of subscriptionsToRenew) {
      try {
        // Create new subscription
        const newStartDate = new Date(subscription.end_date);
        const newEndDate = new Date(newStartDate);
        
        // Add plan duration
        if (subscription.plan.duration_type === 'monthly') {
          newEndDate.setMonth(newEndDate.getMonth() + subscription.plan.duration_value);
        } else if (subscription.plan.duration_type === 'yearly') {
          newEndDate.setFullYear(newEndDate.getFullYear() + subscription.plan.duration_value);
        }

        const newSubscription = await this.query().insert({
          student_id: subscription.student_id,
          plan_id: subscription.plan_id,
          start_date: newStartDate.toISOString(),
          end_date: newEndDate.toISOString(),
          price: subscription.plan.price,
          discount_amount: 0,
          final_price: subscription.plan.price,
          status: 'pending',
          auto_renew: true,
          payment_method: subscription.payment_method
        });

        renewalResults.push({
          success: true,
          originalId: subscription.id,
          newId: newSubscription.id,
          studentId: subscription.student_id
        });

      } catch (error) {
        renewalResults.push({
          success: false,
          originalId: subscription.id,
          studentId: subscription.student_id,
          error: error.message
        });
      }
    }

    return renewalResults;
  }
}

module.exports = Subscription;