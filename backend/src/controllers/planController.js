const Plan = require('../models/Plan');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class PlanController {
  // GET /api/plans
  async getAllPlans(req, res, next) {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const type = req.query.type;

      let query = Plan.query().orderBy('display_order', 'created_at');

      if (!includeInactive) {
        query = query.where('is_active', true);
      }

      if (type) {
        query = query.where('type', type);
      }

      const plans = await query;

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/public
  async getPublicPlans(req, res, next) {
    try {
      const plans = await Plan.query()
        .where('is_active', true)
        .where('is_public', true)
        .orderBy('display_order', 'price');

      // Add calculated prices for each plan
      const plansWithPrices = plans.map(plan => ({
        ...plan,
        discounted_price: plan.calculateDiscountedPrice(),
        is_popular: plan.features && plan.features.includes('popular')
      }));

      res.json({
        success: true,
        data: plansWithPrices
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/:id
  async getPlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.query()
        .findById(id)
        .withGraphFetched('subscriptions(active)')
        .modifiers({
          active: builder => builder.where('status', 'active')
        });

      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      // Add calculated values
      const planWithDetails = {
        ...plan,
        discounted_price: plan.calculateDiscountedPrice(),
        current_capacity: plan.subscriptions ? plan.subscriptions.length : 0,
        is_full: plan.isFull(),
        capacity_percentage: plan.getCapacityPercentage()
      };

      res.json({
        success: true,
        data: planWithDetails
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plans
  async createPlan(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const planData = {
        ...req.body,
        is_active: true
      };

      const plan = await Plan.query().insert(planData);

      logger.info(`Plan created: ${plan.name}`, {
        planId: plan.id,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'Plano criado com sucesso',
        data: plan
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/plans/:id
  async updatePlan(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const plan = await Plan.query().findById(id);
      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      const updatedPlan = await Plan.query()
        .patchAndFetchById(id, updateData);

      logger.info(`Plan updated: ${updatedPlan.name}`, {
        planId: id,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Plano atualizado com sucesso',
        data: updatedPlan
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/plans/:id
  async deletePlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.query()
        .findById(id)
        .withGraphFetched('subscriptions(active)')
        .modifiers({
          active: builder => builder.where('status', 'active')
        });

      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      // Check if plan has active subscriptions
      if (plan.subscriptions && plan.subscriptions.length > 0) {
        throw new AppError('Não é possível excluir plano com assinaturas ativas', 400);
      }

      // Soft delete - set is_active to false
      await Plan.query()
        .findById(id)
        .patch({ is_active: false });

      logger.info(`Plan deleted: ${plan.name}`, {
        planId: id,
        deletedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Plano excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/:id/subscriptions
  async getPlanSubscriptions(req, res, next) {
    try {
      const { id } = req.params;
      const status = req.query.status;

      const plan = await Plan.query().findById(id);
      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      let query = plan.$relatedQuery('subscriptions')
        .withGraphFetched('student.user')
        .orderBy('created_at', 'desc');

      if (status) {
        query = query.where('status', status);
      }

      const subscriptions = await query;

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/types
  async getPlanTypes(req, res, next) {
    try {
      const types = await Plan.query()
        .distinct('type')
        .whereNotNull('type')
        .where('is_active', true)
        .orderBy('type');

      res.json({
        success: true,
        data: types.map(t => t.type)
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/pricing
  async getPlanPricing(req, res, next) {
    try {
      const plans = await Plan.query()
        .where('is_active', true)
        .where('is_public', true)
        .orderBy('price');

      const pricing = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.type,
        price: plan.price,
        discounted_price: plan.calculateDiscountedPrice(),
        discount_percentage: plan.discount_percentage,
        duration_months: plan.duration_months,
        features: plan.features,
        is_popular: plan.features && plan.features.includes('popular')
      }));

      res.json({
        success: true,
        data: pricing
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plans/:id/activate
  async activatePlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.query().findById(id);
      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      await Plan.query()
        .findById(id)
        .patch({ is_active: true });

      logger.info(`Plan activated: ${plan.name}`, {
        planId: id,
        activatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Plano ativado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plans/:id/deactivate
  async deactivatePlan(req, res, next) {
    try {
      const { id } = req.params;

      const plan = await Plan.query().findById(id);
      if (!plan) {
        throw new AppError('Plano não encontrado', 404);
      }

      await Plan.query()
        .findById(id)
        .patch({ is_active: false });

      logger.info(`Plan deactivated: ${plan.name}`, {
        planId: id,
        deactivatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Plano desativado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/plans/stats
  async getPlanStats(req, res, next) {
    try {
      const total = await Plan.query().where('is_active', true).count('* as count').first();
      const active = await Plan.query().where('is_active', true).count('* as count').first();
      const inactive = await Plan.query().where('is_active', false).count('* as count').first();

      // Plans by type
      const byType = await Plan.query()
        .select('type')
        .count('* as count')
        .where('is_active', true)
        .groupBy('type')
        .orderBy('count', 'desc');

      // Revenue potential
      const revenuePotential = await Plan.query()
        .select(Plan.raw('SUM(price) as total_value'))
        .where('is_active', true)
        .first();

      // Most popular plans (by subscription count)
      const mostPopular = await Plan.query()
        .select('plans.*')
        .count('subscriptions.id as subscription_count')
        .leftJoin('subscriptions', 'plans.id', 'subscriptions.plan_id')
        .where('plans.is_active', true)
        .groupBy('plans.id')
        .orderBy('subscription_count', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          active: parseInt(active.count),
          inactive: parseInt(inactive.count),
          byType,
          revenuePotential: parseFloat(revenuePotential.total_value) || 0,
          mostPopular
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plans/bulk-update
  async bulkUpdatePlans(req, res, next) {
    try {
      const { plan_ids, updates } = req.body;

      if (!Array.isArray(plan_ids) || plan_ids.length === 0) {
        throw new AppError('IDs dos planos são obrigatórios', 400);
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new AppError('Dados para atualização são obrigatórios', 400);
      }

      const updatedPlans = await Plan.query()
        .whereIn('id', plan_ids)
        .patch(updates);

      logger.info(`Bulk plans updated: ${updatedPlans} plans`, {
        planIds: plan_ids,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: `${updatedPlans} planos atualizados com sucesso`,
        data: { updated_count: updatedPlans }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlanController();