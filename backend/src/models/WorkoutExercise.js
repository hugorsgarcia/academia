const { Model } = require('objection');

class WorkoutExercise extends Model {
  static get tableName() {
    return 'workout_exercises';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['workout_id', 'exercise_id'],
      properties: {
        id: { type: 'integer' },
        workout_id: { type: 'integer' },
        exercise_id: { type: 'integer' },
        sets: { type: 'integer', default: 1 },
        reps: { type: 'integer', default: 1 },
        weight: { type: 'number' },
        duration: { type: 'integer' }, // in seconds
        rest_time: { type: 'integer', default: 60 }, // in seconds
        notes: { type: 'string' },
        order_index: { type: 'integer', default: 1 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Workout = require('./Workout');
    const Exercise = require('./Exercise');

    return {
      workout: {
        relation: Model.BelongsToOneRelation,
        modelClass: Workout,
        join: {
          from: 'workout_exercises.workout_id',
          to: 'workouts.id'
        }
      },
      exercise: {
        relation: Model.BelongsToOneRelation,
        modelClass: Exercise,
        join: {
          from: 'workout_exercises.exercise_id',
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
  get totalVolume() {
    if (this.weight && this.sets && this.reps) {
      return this.weight * this.sets * this.reps;
    }
    return 0;
  }

  get estimatedCalories() {
    if (!this.exercise) return 0;
    
    // Simple estimation based on exercise type and duration/reps
    const baseCalories = this.exercise.category === 'cardio' ? 8 : 
                        this.exercise.category === 'strength' ? 5 : 3;
    
    if (this.duration) {
      return Math.round((this.duration / 60) * baseCalories);
    } else if (this.sets && this.reps) {
      // Estimate 3 seconds per rep + rest time
      const estimatedDuration = (this.sets * this.reps * 3 + this.rest_time * (this.sets - 1)) / 60;
      return Math.round(estimatedDuration * baseCalories);
    }
    
    return 0;
  }

  get formattedDuration() {
    if (!this.duration) return null;
    
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }

  get formattedRestTime() {
    if (!this.rest_time) return null;
    
    const minutes = Math.floor(this.rest_time / 60);
    const seconds = this.rest_time % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }

  get formattedWeight() {
    if (!this.weight) return null;
    return `${this.weight}kg`;
  }

  get workoutSummary() {
    const parts = [];
    
    if (this.sets && this.reps) {
      parts.push(`${this.sets} x ${this.reps}`);
    }
    
    if (this.weight) {
      parts.push(`${this.weight}kg`);
    }
    
    if (this.duration) {
      parts.push(this.formattedDuration);
    }
    
    return parts.join(' • ') || 'N/A';
  }

  // Instance methods
  async updateProgress(progressData) {
    const updateData = {};
    
    if (progressData.sets !== undefined) updateData.sets = progressData.sets;
    if (progressData.reps !== undefined) updateData.reps = progressData.reps;
    if (progressData.weight !== undefined) updateData.weight = progressData.weight;
    if (progressData.duration !== undefined) updateData.duration = progressData.duration;
    if (progressData.notes !== undefined) updateData.notes = progressData.notes;
    
    return await this.$query().patch(updateData);
  }

  async incrementWeight(amount = 2.5) {
    const newWeight = (this.weight || 0) + amount;
    return await this.$query().patch({ weight: newWeight });
  }

  async incrementReps(amount = 1) {
    const newReps = (this.reps || 0) + amount;
    return await this.$query().patch({ reps: newReps });
  }

  async incrementSets(amount = 1) {
    const newSets = (this.sets || 0) + amount;
    return await this.$query().patch({ sets: newSets });
  }

  // Static methods
  static findByWorkout(workoutId) {
    return this.query()
      .where('workout_id', workoutId)
      .withGraphFetched('exercise')
      .orderBy('order_index');
  }

  static findByExercise(exerciseId) {
    return this.query()
      .where('exercise_id', exerciseId)
      .withGraphFetched('workout')
      .orderBy('created_at', 'desc');
  }

  static async getExerciseUsageStats(exerciseId) {
    const totalUsage = await this.query()
      .where('exercise_id', exerciseId)
      .count('* as count')
      .first();

    const avgSets = await this.query()
      .where('exercise_id', exerciseId)
      .avg('sets as avg_sets')
      .first();

    const avgReps = await this.query()
      .where('exercise_id', exerciseId)
      .avg('reps as avg_reps')
      .first();

    const avgWeight = await this.query()
      .where('exercise_id', exerciseId)
      .whereNotNull('weight')
      .avg('weight as avg_weight')
      .first();

    const avgDuration = await this.query()
      .where('exercise_id', exerciseId)
      .whereNotNull('duration')
      .avg('duration as avg_duration')
      .first();

    return {
      totalUsage: parseInt(totalUsage.count),
      averages: {
        sets: parseFloat(avgSets.avg_sets) || 0,
        reps: parseFloat(avgReps.avg_reps) || 0,
        weight: parseFloat(avgWeight.avg_weight) || 0,
        duration: parseFloat(avgDuration.avg_duration) || 0
      }
    };
  }

  static async getMostUsedExercises(limit = 10) {
    return await this.query()
      .select('exercise_id')
      .count('* as usage_count')
      .join('exercises', 'workout_exercises.exercise_id', 'exercises.id')
      .select('exercises.name as exercise_name', 'exercises.category')
      .groupBy('exercise_id', 'exercises.name', 'exercises.category')
      .orderBy('usage_count', 'desc')
      .limit(limit);
  }

  static async getWorkoutComplexity(workoutId) {
    const exercises = await this.query()
      .where('workout_id', workoutId)
      .withGraphFetched('exercise');

    const totalExercises = exercises.length;
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const totalReps = exercises.reduce((sum, ex) => sum + (ex.reps || 0), 0);
    const estimatedDuration = exercises.reduce((sum, ex) => {
      if (ex.duration) return sum + ex.duration;
      // Estimate duration based on sets, reps, and rest
      const exerciseTime = (ex.sets || 1) * (ex.reps || 1) * 3; // 3 seconds per rep
      const restTime = ((ex.sets || 1) - 1) * (ex.rest_time || 60);
      return sum + exerciseTime + restTime;
    }, 0);

    const muscleGroups = new Set();
    exercises.forEach(ex => {
      if (ex.exercise && ex.exercise.muscle_groups) {
        ex.exercise.muscle_groups.forEach(muscle => muscleGroups.add(muscle));
      }
    });

    return {
      totalExercises,
      totalSets,
      totalReps,
      estimatedDuration: Math.round(estimatedDuration / 60), // in minutes
      muscleGroupsTargeted: muscleGroups.size,
      complexity: totalExercises * 0.3 + totalSets * 0.2 + muscleGroups.size * 0.5
    };
  }

  static async reorderExercisesInWorkout(workoutId, exerciseOrder) {
    const updates = exerciseOrder.map((exerciseId, index) => 
      this.query()
        .where('workout_id', workoutId)
        .where('exercise_id', exerciseId)
        .patch({ order_index: index + 1 })
    );

    await Promise.all(updates);
    return true;
  }

  static async bulkUpdateExercises(workoutId, exercises) {
    const updates = exercises.map(exercise => 
      this.query()
        .where('workout_id', workoutId)
        .where('exercise_id', exercise.exercise_id)
        .patch({
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
          rest_time: exercise.rest_time,
          notes: exercise.notes,
          order_index: exercise.order_index
        })
    );

    await Promise.all(updates);
    return true;
  }
}

module.exports = WorkoutExercise;