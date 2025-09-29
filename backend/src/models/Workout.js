const { Model } = require('objection');

class Workout extends Model {
  static get tableName() {
    return 'workouts';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'student_id', 'trainer_id'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', maxLength: 255 },
        description: { type: 'string' },
        student_id: { type: 'integer' },
        trainer_id: { type: 'integer' },
        type: { 
          type: 'string',
          enum: ['strength', 'cardio', 'flexibility', 'sports', 'rehabilitation', 'mixed'],
          default: 'mixed'
        },
        difficulty_level: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner'
        },
        estimated_duration: { type: 'integer' }, // in minutes
        instructions: { type: 'string' },
        goals: { type: 'array', items: { type: 'string' } },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'completed'],
          default: 'active'
        },
        is_template: { type: 'boolean', default: false },
        template_name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Student = require('./Student');
    const Trainer = require('./Trainer');
    const WorkoutExercise = require('./WorkoutExercise');
    const Exercise = require('./Exercise');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: Student,
        join: {
          from: 'workouts.student_id',
          to: 'students.id'
        }
      },
      trainer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Trainer,
        join: {
          from: 'workouts.trainer_id',
          to: 'trainers.id'
        }
      },
      workoutExercises: {
        relation: Model.HasManyRelation,
        modelClass: WorkoutExercise,
        join: {
          from: 'workouts.id',
          to: 'workout_exercises.workout_id'
        }
      },
      exercises: {
        relation: Model.ManyToManyRelation,
        modelClass: Exercise,
        join: {
          from: 'workouts.id',
          through: {
            from: 'workout_exercises.workout_id',
            to: 'workout_exercises.exercise_id'
          },
          to: 'exercises.id'
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
  get totalExercises() {
    return this.workoutExercises ? this.workoutExercises.length : 0;
  }

  get estimatedCalories() {
    if (!this.workoutExercises || !this.workoutExercises.length) return 0;
    
    // Simple estimation based on duration and exercise types
    const baseCaloriesPerMinute = this.type === 'cardio' ? 8 : 
                                  this.type === 'strength' ? 6 : 
                                  this.type === 'flexibility' ? 3 : 5;
    
    return Math.round((this.estimated_duration || 30) * baseCaloriesPerMinute);
  }

  get difficultyScore() {
    const scores = { beginner: 1, intermediate: 2, advanced: 3 };
    return scores[this.difficulty_level] || 1;
  }

  get formattedGoals() {
    if (!this.goals || !Array.isArray(this.goals)) return [];
    return this.goals.map(goal => ({
      name: goal,
      formatted: goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  // Instance methods
  async addExercise(exerciseId, exerciseData = {}) {
    const WorkoutExercise = require('./WorkoutExercise');
    
    // Get the next order index
    const lastExercise = await this.$relatedQuery('workoutExercises')
      .orderBy('order_index', 'desc')
      .first();
    
    const orderIndex = lastExercise ? lastExercise.order_index + 1 : 1;

    return await WorkoutExercise.query().insert({
      workout_id: this.id,
      exercise_id: exerciseId,
      sets: exerciseData.sets || 1,
      reps: exerciseData.reps || 1,
      weight: exerciseData.weight || null,
      duration: exerciseData.duration || null,
      rest_time: exerciseData.rest_time || 60,
      notes: exerciseData.notes || null,
      order_index: orderIndex
    });
  }

  async removeExercise(exerciseId) {
    const WorkoutExercise = require('./WorkoutExercise');
    
    return await WorkoutExercise.query()
      .where('workout_id', this.id)
      .where('exercise_id', exerciseId)
      .delete();
  }

  async reorderExercises(exerciseOrder) {
    const WorkoutExercise = require('./WorkoutExercise');
    
    const updates = exerciseOrder.map((exerciseId, index) => 
      WorkoutExercise.query()
        .where('workout_id', this.id)
        .where('exercise_id', exerciseId)
        .patch({ order_index: index + 1 })
    );

    await Promise.all(updates);
  }

  async duplicate(newName, studentId = null, trainerId = null) {
    const duplicatedWorkout = await Workout.query().insert({
      name: newName || `${this.name} (Cópia)`,
      description: this.description,
      student_id: studentId || this.student_id,
      trainer_id: trainerId || this.trainer_id,
      type: this.type,
      difficulty_level: this.difficulty_level,
      estimated_duration: this.estimated_duration,
      instructions: this.instructions,
      goals: this.goals,
      status: 'active',
      is_template: false
    });

    // Copy exercises
    const exercises = await this.$relatedQuery('workoutExercises');
    if (exercises.length > 0) {
      const WorkoutExercise = require('./WorkoutExercise');
      const exercisesToCopy = exercises.map(exercise => ({
        workout_id: duplicatedWorkout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
        rest_time: exercise.rest_time,
        notes: exercise.notes,
        order_index: exercise.order_index
      }));

      await WorkoutExercise.query().insert(exercisesToCopy);
    }

    return duplicatedWorkout;
  }

  async convertToTemplate(templateName) {
    return await this.$query().patch({
      is_template: true,
      template_name: templateName || this.name,
      student_id: null // Templates don't belong to specific students
    });
  }

  async complete() {
    return await this.$query().patch({
      status: 'completed'
    });
  }

  // Static methods
  static findByStudent(studentId) {
    return this.query()
      .where('student_id', studentId)
      .withGraphFetched('[trainer.user, workoutExercises.[exercise]]')
      .orderBy('created_at', 'desc');
  }

  static findByTrainer(trainerId) {
    return this.query()
      .where('trainer_id', trainerId)
      .withGraphFetched('[student.user, workoutExercises.[exercise]]')
      .orderBy('created_at', 'desc');
  }

  static findTemplates() {
    return this.query()
      .where('is_template', true)
      .where('status', 'active')
      .withGraphFetched('[trainer.user, workoutExercises.[exercise]]')
      .orderBy('template_name');
  }

  static findByType(type) {
    return this.query()
      .where('type', type)
      .where('status', 'active')
      .withGraphFetched('[student.user, trainer.user]')
      .orderBy('created_at', 'desc');
  }

  static findByDifficulty(difficulty) {
    return this.query()
      .where('difficulty_level', difficulty)
      .where('status', 'active')
      .withGraphFetched('[student.user, trainer.user]')
      .orderBy('created_at', 'desc');
  }

  static searchWorkouts(query) {
    return this.query()
      .where('status', 'active')
      .where(builder => {
        builder
          .where('name', 'like', `%${query}%`)
          .orWhere('description', 'like', `%${query}%`)
          .orWhere('instructions', 'like', `%${query}%`)
          .orWhereJsonSupersetOf('goals', [query]);
      })
      .withGraphFetched('[student.user, trainer.user]')
      .orderBy('created_at', 'desc');
  }

  static async getWorkoutStats() {
    const total = await this.query().count('* as count').first();
    const active = await this.query().where('status', 'active').count('* as count').first();
    const templates = await this.query().where('is_template', true).count('* as count').first();
    const completed = await this.query().where('status', 'completed').count('* as count').first();

    // By type
    const byType = await this.query()
      .select('type')
      .count('* as count')
      .where('status', 'active')
      .groupBy('type')
      .orderBy('count', 'desc');

    // By difficulty
    const byDifficulty = await this.query()
      .select('difficulty_level')
      .count('* as count')
      .where('status', 'active')
      .groupBy('difficulty_level')
      .orderBy('count', 'desc');

    // Most active trainers
    const topTrainers = await this.query()
      .select('trainer_id')
      .count('* as workouts_created')
      .join('trainers', 'workouts.trainer_id', 'trainers.id')
      .join('users', 'trainers.user_id', 'users.id')
      .select('users.name as trainer_name')
      .where('workouts.status', 'active')
      .groupBy('trainer_id', 'users.name')
      .orderBy('workouts_created', 'desc')
      .limit(5);

    return {
      total: parseInt(total.count),
      active: parseInt(active.count),
      templates: parseInt(templates.count),
      completed: parseInt(completed.count),
      byType,
      byDifficulty,
      topTrainers
    };
  }

  static async getMostPopularExercises(limit = 10) {
    const WorkoutExercise = require('./WorkoutExercise');
    
    return await WorkoutExercise.query()
      .select('exercise_id')
      .count('* as usage_count')
      .join('exercises', 'workout_exercises.exercise_id', 'exercises.id')
      .select('exercises.name as exercise_name')
      .groupBy('exercise_id', 'exercises.name')
      .orderBy('usage_count', 'desc')
      .limit(limit);
  }
}

module.exports = Workout;