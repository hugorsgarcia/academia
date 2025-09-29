const { Model } = require('objection');

class Exercise extends Model {
  static get tableName() {
    return 'exercises';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'category', 'difficulty_level'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', maxLength: 150 },
        description: { type: 'string' },
        category: { type: 'string', maxLength: 50 },
        target_muscles: { type: 'object' },
        equipment_needed: { type: 'array' },
        difficulty_level: { 
          type: 'string', 
          enum: ['beginner', 'intermediate', 'advanced'] 
        },
        instructions: { type: 'string' },
        media_urls: { type: 'object' },
        estimated_duration_minutes: { type: 'integer', minimum: 1 },
        calories_per_minute: { type: 'integer', minimum: 0 },
        safety_tips: { type: 'array' },
        variations: { type: 'array' },
        is_active: { type: 'boolean', default: true },
        created_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const WorkoutExercise = require('./WorkoutExercise');

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'exercises.created_by',
          to: 'users.id'
        }
      },
      workoutExercises: {
        relation: Model.HasManyRelation,
        modelClass: WorkoutExercise,
        join: {
          from: 'exercises.id',
          to: 'workout_exercises.exercise_id'
        }
      }
    };
  }

  // Virtual properties
  get estimatedCalories() {
    if (this.estimated_duration_minutes && this.calories_per_minute) {
      return this.estimated_duration_minutes * this.calories_per_minute;
    }
    return null;
  }

  get primaryMuscles() {
    return this.target_muscles?.primary || [];
  }

  get secondaryMuscles() {
    return this.target_muscles?.secondary || [];
  }

  get hasVideo() {
    return this.media_urls?.videos && this.media_urls.videos.length > 0;
  }

  get hasImages() {
    return this.media_urls?.images && this.media_urls.images.length > 0;
  }

  // Instance methods
  async getUsageCount() {
    return await this.$relatedQuery('workoutExercises')
      .count('* as count')
      .first()
      .then(result => parseInt(result.count));
  }

  // Static methods
  static async findByCategory(category) {
    return await this.query()
      .where('category', category)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }

  static async findByDifficulty(difficulty) {
    return await this.query()
      .where('difficulty_level', difficulty)
      .where('is_active', true)
      .orderBy('category', 'asc')
      .orderBy('name', 'asc');
  }

  static async findByMuscleGroup(muscleGroup) {
    return await this.query()
      .where('is_active', true)
      .whereJsonPath('target_muscles.primary', '[*]', 'like', `%${muscleGroup}%`)
      .orWhereJsonPath('target_muscles.secondary', '[*]', 'like', `%${muscleGroup}%`)
      .orderBy('difficulty_level', 'asc');
  }

  static async findByEquipment(equipment) {
    return await this.query()
      .where('is_active', true)
      .whereJsonPath('equipment_needed', '[*]', 'like', `%${equipment}%`)
      .orderBy('difficulty_level', 'asc');
  }

  static async searchExercises(searchTerm) {
    return await this.query()
      .where('is_active', true)
      .where(builder => {
        builder
          .where('name', 'like', `%${searchTerm}%`)
          .orWhere('description', 'like', `%${searchTerm}%`)
          .orWhere('category', 'like', `%${searchTerm}%`);
      })
      .orderBy('name', 'asc');
  }

  static async getPopularExercises(limit = 10) {
    return await this.query()
      .select('exercises.*')
      .leftJoin('workout_exercises', 'exercises.id', 'workout_exercises.exercise_id')
      .where('exercises.is_active', true)
      .groupBy('exercises.id')
      .orderByRaw('COUNT(workout_exercises.id) DESC')
      .limit(limit);
  }

  static async getExercisesByCreator(userId) {
    return await this.query()
      .where('created_by', userId)
      .orderBy('created_at', 'desc');
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = Exercise;