const { Model } = require('objection');

class Plan extends Model {
  static get tableName() {
    return 'plans';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'price', 'duration_days', 'type'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', maxLength: 100 },
        description: { type: 'string' },
        price: { type: 'number', minimum: 0 },
        duration_days: { type: 'integer', minimum: 1 },
        type: { 
          type: 'string', 
          enum: ['monthly', 'quarterly', 'semi_annual', 'annual', 'daily', 'custom'] 
        },
        features: { type: 'array' },
        is_active: { type: 'boolean', default: true },
        is_popular: { type: 'boolean', default: false },
        max_students: { type: ['integer', 'null'] },
        discount_percentage: { type: 'number', minimum: 0, maximum: 100 },
        trial_days: { type: 'integer', minimum: 0 },
        access_permissions: { type: 'object' }
      }
    };
  }

  static get relationMappings() {
    const Subscription = require('./Subscription');

    return {
      subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: 'plans.id',
          to: 'subscriptions.plan_id'
        }
      }
    };
  }

  // Virtual properties
  get discountedPrice() {
    if (this.discount_percentage > 0) {
      return this.price * (1 - this.discount_percentage / 100);
    }
    return this.price;
  }

  get pricePerDay() {
    return this.price / this.duration_days;
  }

  get isUnlimited() {
    return this.max_students === null;
  }

  // Instance methods
  async getActiveSubscriptionsCount() {
    return await this.$relatedQuery('subscriptions')
      .where('status', 'active')
      .count('* as count')
      .first()
      .then(result => parseInt(result.count));
  }

  async canAcceptNewStudents() {
    if (this.isUnlimited) return true;
    
    const activeCount = await this.getActiveSubscriptionsCount();
    return activeCount < this.max_students;
  }

  calculateEndDate(startDate) {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + this.duration_days);
    return endDate;
  }

  // Static methods
  static async getActivePlans() {
    return await this.query()
      .where('is_active', true)
      .orderBy('price', 'asc');
  }

  static async getPopularPlans() {
    return await this.query()
      .where('is_active', true)
      .where('is_popular', true)
      .orderBy('price', 'asc');
  }

  static async getPlansByType(type) {
    return await this.query()
      .where('is_active', true)
      .where('type', type)
      .orderBy('price', 'asc');
  }

  $beforeInsert() {
    const now = new Date();
    this.created_at = now.toISOString().slice(0, 19).replace('T', ' ');
    this.updated_at = now.toISOString().slice(0, 19).replace('T', ' ');
  }

  $beforeUpdate() {
    const now = new Date();
    this.updated_at = now.toISOString().slice(0, 19).replace('T', ' ');
  }
}

module.exports = Plan;