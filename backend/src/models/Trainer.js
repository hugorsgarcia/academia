const { Model } = require('objection');
const User = require('./User');

class Trainer extends Model {
  static get tableName() {
    return 'trainers';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'registration_number'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        registration_number: { type: 'string', maxLength: 20 },
        specialties: { type: 'array', items: { type: 'string' } },
        certifications: { type: 'array', items: { type: 'object' } },
        bio: { type: 'string' },
        experience_years: { type: 'integer' },
        hourly_rate: { type: 'number' },
        availability: { type: 'object' },
        max_students: { type: 'integer' },
        is_active: { type: 'boolean', default: true },
        hire_date: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Student = require('./Student');
    const Workout = require('./Workout');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'trainers.user_id',
          to: 'users.id'
        }
      },
      students: {
        relation: Model.ManyToManyRelation,
        modelClass: Student,
        join: {
          from: 'trainers.id',
          through: {
            from: 'trainer_students.trainer_id',
            to: 'trainer_students.student_id'
          },
          to: 'students.id'
        }
      },
      workouts: {
        relation: Model.HasManyRelation,
        modelClass: Workout,
        join: {
          from: 'trainers.id',
          to: 'workouts.trainer_id'
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

  // Instance methods
  get fullName() {
    return this.user ? this.user.name : '';
  }

  get yearsOfExperience() {
    if (!this.hire_date) return 0;
    const hireDate = new Date(this.hire_date);
    const now = new Date();
    return Math.floor((now - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
  }

  get currentStudentCount() {
    return this.students ? this.students.length : 0;
  }

  get canAcceptMoreStudents() {
    return !this.max_students || this.currentStudentCount < this.max_students;
  }

  // Get formatted specialties
  get formattedSpecialties() {
    if (!this.specialties || !Array.isArray(this.specialties)) {
      return [];
    }
    return this.specialties.map(specialty => ({
      name: specialty,
      formatted: specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  // Check if trainer is available on specific day/time
  isAvailable(day, hour) {
    if (!this.availability || !this.availability[day]) {
      return false;
    }
    
    const daySchedule = this.availability[day];
    if (!daySchedule.active) return false;
    
    return hour >= daySchedule.start && hour <= daySchedule.end;
  }

  // Static methods
  static findByRegistrationNumber(registrationNumber) {
    return this.query()
      .where('registration_number', registrationNumber)
      .withGraphFetched('user')
      .first();
  }

  static findActiveTrainers() {
    return this.query()
      .where('is_active', true)
      .withGraphFetched('user')
      .orderBy('created_at', 'desc');
  }

  static findBySpecialty(specialty) {
    return this.query()
      .where('is_active', true)
      .whereJsonSupersetOf('specialties', [specialty])
      .withGraphFetched('user');
  }

  static findAvailableTrainers(day, hour) {
    return this.query()
      .where('is_active', true)
      .whereRaw(`JSON_EXTRACT(availability, '$.${day}.active') = true`)
      .whereRaw(`JSON_EXTRACT(availability, '$.${day}.start') <= ?`, [hour])
      .whereRaw(`JSON_EXTRACT(availability, '$.${day}.end') >= ?`, [hour])
      .withGraphFetched('user');
  }

  static async getTrainerStats() {
    const total = await this.query().count('* as count').first();
    const active = await this.query().where('is_active', true).count('* as count').first();
    const bySpecialty = await this.query()
      .select('specialties')
      .where('is_active', true);

    // Count specialties
    const specialtyCount = {};
    bySpecialty.forEach(trainer => {
      if (trainer.specialties && Array.isArray(trainer.specialties)) {
        trainer.specialties.forEach(specialty => {
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
        });
      }
    });

    return {
      total: parseInt(total.count),
      active: parseInt(active.count),
      specialtyDistribution: specialtyCount
    };
  }
}

module.exports = Trainer;