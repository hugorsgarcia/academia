const Exercise = require('../models/Exercise');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class ExerciseController {
  // GET /api/exercises
  async getAllExercises(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const category = req.query.category;
      const muscle_group = req.query.muscle_group;
      const equipment = req.query.equipment;
      const difficulty = req.query.difficulty;
      const search = req.query.search;

      let query = Exercise.query()
        .where('is_active', true)
        .orderBy('name');

      // Apply filters
      if (category) {
        query = query.where('category', category);
      }

      if (muscle_group) {
        query = query.whereJsonSupersetOf('muscle_groups', [muscle_group]);
      }

      if (equipment) {
        query = query.whereJsonSupersetOf('equipment_needed', [equipment]);
      }

      if (difficulty) {
        query = query.where('difficulty_level', difficulty);
      }

      // Search functionality
      if (search) {
        query = query.where(builder => {
          builder
            .where('name', 'like', `%${search}%`)
            .orWhere('description', 'like', `%${search}%`)
            .orWhereJsonSupersetOf('muscle_groups', [search])
            .orWhereJsonSupersetOf('equipment_needed', [search]);
        });
      }

      const total = await query.resultSize();
      const exercises = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: exercises.results,
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

  // GET /api/exercises/:id
  async getExercise(req, res, next) {
    try {
      const { id } = req.params;

      const exercise = await Exercise.query()
        .findById(id)
        .where('is_active', true);

      if (!exercise) {
        throw new AppError('Exercício não encontrado', 404);
      }

      // Increment view count
      await Exercise.query()
        .findById(id)
        .increment('usage_count', 1);

      res.json({
        success: true,
        data: exercise
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/exercises
  async createExercise(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const exerciseData = {
        ...req.body,
        created_by: req.user.id,
        is_active: true,
        usage_count: 0
      };

      const exercise = await Exercise.query().insert(exerciseData);

      logger.info(`Exercise created: ${exercise.name}`, {
        exerciseId: exercise.id,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Exercício criado com sucesso',
        data: exercise
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/exercises/:id
  async updateExercise(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const exercise = await Exercise.query().findById(id);
      if (!exercise) {
        throw new AppError('Exercício não encontrado', 404);
      }

      const updatedExercise = await Exercise.query()
        .patchAndFetchById(id, updateData);

      logger.info(`Exercise updated: ${updatedExercise.name}`, {
        exerciseId: id,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Exercício atualizado com sucesso',
        data: updatedExercise
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/exercises/:id
  async deleteExercise(req, res, next) {
    try {
      const { id } = req.params;

      const exercise = await Exercise.query().findById(id);
      if (!exercise) {
        throw new AppError('Exercício não encontrado', 404);
      }

      // Soft delete - set is_active to false
      await Exercise.query()
        .findById(id)
        .patch({ is_active: false });

      logger.info(`Exercise deleted: ${exercise.name}`, {
        exerciseId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Exercício excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/categories
  async getCategories(req, res, next) {
    try {
      const categories = await Exercise.query()
        .distinct('category')
        .whereNotNull('category')
        .where('is_active', true)
        .orderBy('category');

      res.json({
        success: true,
        data: categories.map(c => c.category)
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/muscle-groups
  async getMuscleGroups(req, res, next) {
    try {
      const exercises = await Exercise.query()
        .select('muscle_groups')
        .where('is_active', true)
        .whereNotNull('muscle_groups');

      const muscleGroups = new Set();
      exercises.forEach(exercise => {
        if (exercise.muscle_groups) {
          exercise.muscle_groups.forEach(group => muscleGroups.add(group));
        }
      });

      res.json({
        success: true,
        data: Array.from(muscleGroups).sort()
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/equipment
  async getEquipment(req, res, next) {
    try {
      const exercises = await Exercise.query()
        .select('equipment_needed')
        .where('is_active', true)
        .whereNotNull('equipment_needed');

      const equipment = new Set();
      exercises.forEach(exercise => {
        if (exercise.equipment_needed) {
          exercise.equipment_needed.forEach(eq => equipment.add(eq));
        }
      });

      res.json({
        success: true,
        data: Array.from(equipment).sort()
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/popular
  async getPopularExercises(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const exercises = await Exercise.query()
        .where('is_active', true)
        .orderBy('usage_count', 'desc')
        .limit(limit);

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/search
  async searchExercises(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        throw new AppError('Query deve ter pelo menos 2 caracteres', 400);
      }

      const exercises = await Exercise.searchByName(q);

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/filter
  async filterExercises(req, res, next) {
    try {
      const { muscle_groups, equipment, difficulty } = req.query;

      let exercises = await Exercise.query().where('is_active', true);

      if (muscle_groups) {
        const groups = Array.isArray(muscle_groups) ? muscle_groups : [muscle_groups];
        exercises = await Exercise.findByMuscleGroups(groups);
      }

      if (equipment) {
        const equipmentList = Array.isArray(equipment) ? equipment : [equipment];
        exercises = await Exercise.findByEquipment(equipmentList);
      }

      if (difficulty) {
        exercises = exercises.filter(ex => ex.difficulty_level === difficulty);
      }

      res.json({
        success: true,
        data: exercises
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/exercises/bulk
  async bulkCreateExercises(req, res, next) {
    try {
      const { exercises } = req.body;

      if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new AppError('Lista de exercícios é obrigatória', 400);
      }

      const exercisesToCreate = exercises.map(exercise => ({
        ...exercise,
        created_by: req.user.id,
        is_active: true,
        usage_count: 0
      }));

      const createdExercises = await Exercise.query().insert(exercisesToCreate);

      logger.info(`Bulk exercises created: ${createdExercises.length} exercises`, {
        count: createdExercises.length,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: `${createdExercises.length} exercícios criados com sucesso`,
        data: createdExercises
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/exercises/stats
  async getExerciseStats(req, res, next) {
    try {
      const total = await Exercise.query().where('is_active', true).count('* as count').first();
      
      const byCategory = await Exercise.query()
        .select('category')
        .count('* as count')
        .where('is_active', true)
        .groupBy('category')
        .orderBy('count', 'desc');

      const byDifficulty = await Exercise.query()
        .select('difficulty_level')
        .count('* as count')
        .where('is_active', true)
        .groupBy('difficulty_level');

      const mostUsed = await Exercise.query()
        .where('is_active', true)
        .orderBy('usage_count', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          byCategory,
          byDifficulty,
          mostUsed
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExerciseController();