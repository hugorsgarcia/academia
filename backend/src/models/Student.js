const { Model } = require('objection');

class Student extends Model {
  static get tableName() {
    return 'students';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'registration_number'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        registration_number: { type: 'string', maxLength: 50 },
        cpf: { type: 'string', maxLength: 14 },
        birth_date: { type: 'string', format: 'date' },
        phone: { type: 'string', maxLength: 20 },
        emergency_contact_name: { type: 'string', maxLength: 100 },
        emergency_contact_phone: { type: 'string', maxLength: 20 },
        address: { type: 'string' },
        medical_conditions: { type: 'string' },
        fitness_goals: { type: 'string' },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'suspended', 'pending'],
          default: 'pending' 
        },
        enrollment_date: { type: 'string', format: 'date' },
        body_measurements: { type: 'object' },
        preferences: { type: 'object' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Subscription = require('./Subscription');
    const Workout = require('./Workout');
    const Checkin = require('./Checkin');
    const Payment = require('./Payment');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'students.user_id',
          to: 'users.id'
        }
      },
      subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: 'students.id',
          to: 'subscriptions.student_id'
        }
      },
      workouts: {
        relation: Model.HasManyRelation,
        modelClass: Workout,
        join: {
          from: 'students.id',
          to: 'workouts.student_id'
        }
      },
      checkins: {
        relation: Model.HasManyRelation,
        modelClass: Checkin,
        join: {
          from: 'students.id',
          to: 'checkins.student_id'
        }
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'students.id',
          to: 'payments.student_id'
        }
      }
    };
  }

  // Virtual properties
  get age() {
    if (!this.birth_date) return null;
    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get isActive() {
    return this.status === 'active';
  }

  // Instance methods
  async getCurrentSubscription() {
    return await this.$relatedQuery('subscriptions')
      .where('status', 'active')
      .where('start_date', '<=', new Date())
      .where('end_date', '>=', new Date())
      .first();
  }

  async getActiveWorkouts() {
    return await this.$relatedQuery('workouts')
      .where('status', 'active')
      .withGraphFetched('[exercises, trainer.user]');
  }

  async getMonthlyCheckins(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.$relatedQuery('checkins')
      .whereBetween('checkin_time', [startDate, endDate])
      .orderBy('checkin_time', 'desc');
  }

  // Static methods
  static async findByRegistration(registrationNumber) {
    return await this.query()
      .where('registration_number', registrationNumber)
      .withGraphFetched('user')
      .first();
  }

  static async findByCpf(cpf) {
    return await this.query()
      .where('cpf', cpf)
      .withGraphFetched('user')
      .first();
  }

  static async getActiveStudents() {
    return await this.query()
      .where('status', 'active')
      .withGraphFetched('user')
      .orderBy('enrollment_date', 'desc');
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

module.exports = Student;