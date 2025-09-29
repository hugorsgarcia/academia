const Workout = require('../models/Workout');
const Student = require('../models/Student');
const Exercise = require('../models/Exercise');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class WorkoutController {
  // GET /api/workouts
  async getAllWorkouts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const student_id = req.query.student_id;
      const trainer_id = req.query.trainer_id;
      const status = req.query.status;

      let query = Workout.query()
        .withGraphFetched('[student.user, trainer.user, exercises]')
        .orderBy('created_at', 'desc');

      // Apply filters
      if (student_id) {
        query = query.where('student_id', student_id);
      }

      if (trainer_id) {
        query = query.where('trainer_id', trainer_id);
      }

      if (status) {
        query = query.where('status', status);
      }

      const total = await query.resultSize();
      const workouts = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: workouts.results,
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

  // GET /api/workouts/:id
  async getWorkout(req, res, next) {
    try {
      const { id } = req.params;

      const workout = await Workout.query()
        .findById(id)
        .withGraphFetched(`[
          student.user,
          trainer.user,
          exercises.[exercise],
          workoutExercises.[exercise]
        ]`);

      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      res.json({
        success: true,
        data: workout
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/workouts
  async createWorkout(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { student_id, exercises, ...workoutData } = req.body;

      // Verify student exists
      const student = await Student.query().findById(student_id);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Create workout
      const workout = await Workout.query().insert({
        ...workoutData,
        student_id,
        trainer_id: req.user.id,
        status: 'active'
      });

      // Add exercises if provided
      if (exercises && exercises.length > 0) {
        const workoutExercises = exercises.map((exercise, index) => ({
          workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets || 1,
          reps: exercise.reps || 1,
          weight: exercise.weight || null,
          duration: exercise.duration || null,
          rest_time: exercise.rest_time || null,
          notes: exercise.notes || null,
          order_index: index + 1
        }));

        await workout.$relatedQuery('workoutExercises').insert(workoutExercises);
      }

      // Fetch complete workout
      const completeWorkout = await Workout.query()
        .findById(workout.id)
        .withGraphFetched('[student.user, trainer.user, workoutExercises.[exercise]]');

      logger.info(`Workout created for student: ${student_id}`, {
        workoutId: workout.id,
        trainerId: req.user.id,
        studentId: student_id
      });

      res.status(201).json({
        success: true,
        message: 'Treino criado com sucesso',
        data: completeWorkout
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/workouts/:id
  async updateWorkout(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const { exercises, ...updateData } = req.body;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      // Update workout basic info
      const updatedWorkout = await Workout.query()
        .patchAndFetchById(id, updateData);

      // Update exercises if provided
      if (exercises) {
        // Remove existing exercises
        await workout.$relatedQuery('workoutExercises').delete();

        // Add new exercises
        if (exercises.length > 0) {
          const workoutExercises = exercises.map((exercise, index) => ({
            workout_id: workout.id,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets || 1,
            reps: exercise.reps || 1,
            weight: exercise.weight || null,
            duration: exercise.duration || null,
            rest_time: exercise.rest_time || null,
            notes: exercise.notes || null,
            order_index: index + 1
          }));

          await workout.$relatedQuery('workoutExercises').insert(workoutExercises);
        }
      }

      // Fetch complete updated workout
      const completeWorkout = await Workout.query()
        .findById(id)
        .withGraphFetched('[student.user, trainer.user, workoutExercises.[exercise]]');

      logger.info(`Workout updated: ${workout.name}`, {
        workoutId: id,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Treino atualizado com sucesso',
        data: completeWorkout
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/workouts/:id
  async deleteWorkout(req, res, next) {
    try {
      const { id } = req.params;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      // Soft delete - change status to inactive
      await Workout.query()
        .findById(id)
        .patch({ status: 'inactive' });

      logger.info(`Workout deleted: ${workout.name}`, {
        workoutId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Treino excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/workouts/:id/exercises
  async getWorkoutExercises(req, res, next) {
    try {
      const { id } = req.params;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      const exercises = await workout.$relatedQuery('workoutExercises')
        .withGraphFetched('exercise')
        .orderBy('order_index');

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/workouts/:id/exercises
  async addExerciseToWorkout(req, res, next) {
    try {
      const { id } = req.params;
      const exerciseData = req.body;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      // Verify exercise exists
      const exercise = await Exercise.query().findById(exerciseData.exercise_id);
      if (!exercise) {
        throw new AppError('Exercício não encontrado', 404);
      }

      // Get next order index
      const lastExercise = await workout.$relatedQuery('workoutExercises')
        .orderBy('order_index', 'desc')
        .first();

      const orderIndex = lastExercise ? lastExercise.order_index + 1 : 1;

      const workoutExercise = await workout.$relatedQuery('workoutExercises').insert({
        exercise_id: exerciseData.exercise_id,
        sets: exerciseData.sets || 1,
        reps: exerciseData.reps || 1,
        weight: exerciseData.weight || null,
        duration: exerciseData.duration || null,
        rest_time: exerciseData.rest_time || null,
        notes: exerciseData.notes || null,
        order_index: orderIndex
      });

      const completeWorkoutExercise = await workout.$relatedQuery('workoutExercises')
        .findById(workoutExercise.id)
        .withGraphFetched('exercise');

      res.status(201).json({
        success: true,
        message: 'Exercício adicionado ao treino',
        data: completeWorkoutExercise
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/workouts/:id/exercises/:exerciseId
  async removeExerciseFromWorkout(req, res, next) {
    try {
      const { id, exerciseId } = req.params;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      const deleted = await workout.$relatedQuery('workoutExercises')
        .deleteById(exerciseId);

      if (!deleted) {
        throw new AppError('Exercício não encontrado no treino', 404);
      }

      res.json({
        success: true,
        message: 'Exercício removido do treino'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/workouts/:id/copy
  async copyWorkout(req, res, next) {
    try {
      const { id } = req.params;
      const { student_id, name } = req.body;

      const originalWorkout = await Workout.query()
        .findById(id)
        .withGraphFetched('workoutExercises');

      if (!originalWorkout) {
        throw new AppError('Treino não encontrado', 404);
      }

      // Verify target student exists
      if (student_id) {
        const student = await Student.query().findById(student_id);
        if (!student) {
          throw new AppError('Aluno não encontrado', 404);
        }
      }

      // Create new workout
      const newWorkout = await Workout.query().insert({
        name: name || `${originalWorkout.name} (Cópia)`,
        description: originalWorkout.description,
        student_id: student_id || originalWorkout.student_id,
        trainer_id: req.user.id,
        type: originalWorkout.type,
        difficulty_level: originalWorkout.difficulty_level,
        estimated_duration: originalWorkout.estimated_duration,
        status: 'active'
      });

      // Copy exercises
      if (originalWorkout.workoutExercises && originalWorkout.workoutExercises.length > 0) {
        const exercisesToCopy = originalWorkout.workoutExercises.map(exercise => ({
          workout_id: newWorkout.id,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
          rest_time: exercise.rest_time,
          notes: exercise.notes,
          order_index: exercise.order_index
        }));

        await newWorkout.$relatedQuery('workoutExercises').insert(exercisesToCopy);
      }

      // Fetch complete copied workout
      const completeWorkout = await Workout.query()
        .findById(newWorkout.id)
        .withGraphFetched('[student.user, trainer.user, workoutExercises.[exercise]]');

      logger.info(`Workout copied: ${originalWorkout.name}`, {
        originalId: id,
        newId: newWorkout.id,
        copiedBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Treino copiado com sucesso',
        data: completeWorkout
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/workouts/student/:studentId
  async getStudentWorkouts(req, res, next) {
    try {
      const { studentId } = req.params;
      const status = req.query.status || 'active';

      const student = await Student.query().findById(studentId);
      if (!student) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const workouts = await Workout.query()
        .where('student_id', studentId)
        .where('status', status)
        .withGraphFetched('[trainer.user, workoutExercises.[exercise]]')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: workouts
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/workouts/templates
  async getWorkoutTemplates(req, res, next) {
    try {
      const type = req.query.type;
      const difficulty = req.query.difficulty;

      let query = Workout.query()
        .where('is_template', true)
        .where('status', 'active')
        .withGraphFetched('[trainer.user, workoutExercises.[exercise]]')
        .orderBy('name');

      if (type) {
        query = query.where('type', type);
      }

      if (difficulty) {
        query = query.where('difficulty_level', difficulty);
      }

      const templates = await query;

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/workouts/:id/template
  async convertToTemplate(req, res, next) {
    try {
      const { id } = req.params;

      const workout = await Workout.query().findById(id);
      if (!workout) {
        throw new AppError('Treino não encontrado', 404);
      }

      await Workout.query()
        .findById(id)
        .patch({ is_template: true });

      logger.info(`Workout converted to template: ${workout.name}`, {
        workoutId: id,
        convertedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Treino convertido em modelo'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/workouts/stats
  async getWorkoutStats(req, res, next) {
    try {
      const total = await Workout.query().where('status', 'active').count('* as count').first();
      const templates = await Workout.query().where('is_template', true).count('* as count').first();

      // Workouts by type
      const byType = await Workout.query()
        .select('type')
        .count('* as count')
        .where('status', 'active')
        .groupBy('type');

      // Workouts by difficulty
      const byDifficulty = await Workout.query()
        .select('difficulty_level')
        .count('* as count')
        .where('status', 'active')
        .groupBy('difficulty_level');

      // Most active trainers
      const topTrainers = await Workout.query()
        .select('trainer_id')
        .count('* as count')
        .join('users', 'workouts.trainer_id', 'users.id')
        .select('users.name as trainer_name')
        .where('workouts.status', 'active')
        .groupBy('trainer_id', 'users.name')
        .orderBy('count', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          templates: parseInt(templates.count),
          byType,
          byDifficulty,
          topTrainers
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkoutController();