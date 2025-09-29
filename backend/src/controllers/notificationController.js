const Notification = require('../models/Notification');
const User = require('../models/User');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class NotificationController {
  // GET /api/notifications
  async getAllNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const user_id = req.query.user_id;
      const type = req.query.type;
      const status = req.query.status;
      const priority = req.query.priority;

      let query = Notification.query()
        .withGraphFetched('user')
        .orderBy('created_at', 'desc');

      // Apply filters
      if (user_id) {
        query = query.where('user_id', user_id);
      }

      if (type) {
        query = query.where('type', type);
      }

      if (status) {
        query = query.where('status', status);
      }

      if (priority) {
        query = query.where('priority', priority);
      }

      const total = await query.resultSize();
      const notifications = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: notifications.results,
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

  // GET /api/notifications/:id
  async getNotification(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.query()
        .findById(id)
        .withGraphFetched('user');

      if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
      }

      // Check if user has permission to view this notification
      if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para visualizar esta notificação', 403);
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/user/:userId
  async getUserNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const unread_only = req.query.unread_only === 'true';

      // Check permissions
      if (userId != req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para visualizar notificações deste usuário', 403);
      }

      let query = Notification.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      if (unread_only) {
        query = query.where('status', 'unread');
      }

      const total = await query.resultSize();
      const notifications = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: notifications.results,
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

  // POST /api/notifications
  async createNotification(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { user_id, title, message, type, priority, data, scheduled_for } = req.body;

      // Verify user exists
      const user = await User.query().findById(user_id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const notificationData = {
        user_id,
        title,
        message,
        type: type || 'info',
        priority: priority || 'medium',
        status: 'unread',
        data: data || null,
        scheduled_for: scheduled_for || null,
        created_by: req.user.id
      };

      const notification = await Notification.query().insert(notificationData);

      // Fetch complete notification
      const completeNotification = await Notification.query()
        .findById(notification.id)
        .withGraphFetched('user');

      logger.info(`Notification created for user: ${user_id}`, {
        notificationId: notification.id,
        userId: user_id,
        type,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: completeNotification
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/notifications/bulk
  async createBulkNotifications(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { user_ids, title, message, type, priority, data, scheduled_for } = req.body;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        throw new AppError('Lista de usuários é obrigatória', 400);
      }

      // Verify all users exist
      const users = await User.query().whereIn('id', user_ids);
      if (users.length !== user_ids.length) {
        throw new AppError('Um ou mais usuários não foram encontrados', 404);
      }

      const notifications = user_ids.map(userId => ({
        user_id: userId,
        title,
        message,
        type: type || 'info',
        priority: priority || 'medium',
        status: 'unread',
        data: data || null,
        scheduled_for: scheduled_for || null,
        created_by: req.user.id
      }));

      const createdNotifications = await Notification.query().insert(notifications);

      logger.info(`Bulk notifications created for ${user_ids.length} users`, {
        userIds: user_ids,
        type,
        count: createdNotifications.length,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: `${createdNotifications.length} notificações criadas com sucesso`,
        data: createdNotifications
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.query().findById(id);
      if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
      }

      // Check permissions
      if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para marcar esta notificação', 403);
      }

      const updatedNotification = await Notification.query()
        .patchAndFetchById(id, {
          status: 'read',
          read_at: new Date()
        });

      res.json({
        success: true,
        message: 'Notificação marcada como lida',
        data: updatedNotification
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/:id/unread
  async markAsUnread(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.query().findById(id);
      if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
      }

      // Check permissions
      if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para marcar esta notificação', 403);
      }

      const updatedNotification = await Notification.query()
        .patchAndFetchById(id, {
          status: 'unread',
          read_at: null
        });

      res.json({
        success: true,
        message: 'Notificação marcada como não lida',
        data: updatedNotification
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notifications/user/:userId/read-all
  async markAllAsRead(req, res, next) {
    try {
      const { userId } = req.params;

      // Check permissions
      if (userId != req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para marcar notificações deste usuário', 403);
      }

      const updated = await Notification.query()
        .where('user_id', userId)
        .where('status', 'unread')
        .patch({
          status: 'read',
          read_at: new Date()
        });

      logger.info(`All notifications marked as read for user: ${userId}`, {
        userId,
        count: updated,
        markedBy: req.user.id
      });

      res.json({
        success: true,
        message: `${updated} notificações marcadas como lidas`,
        data: { updated_count: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notifications/:id
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await Notification.query().findById(id);
      if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
      }

      // Check permissions
      if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para excluir esta notificação', 403);
      }

      await Notification.query().deleteById(id);

      logger.info(`Notification deleted: ${id}`, {
        notificationId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Notificação excluída com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/notifications/user/:userId/read
  async deleteReadNotifications(req, res, next) {
    try {
      const { userId } = req.params;

      // Check permissions
      if (userId != req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para excluir notificações deste usuário', 403);
      }

      const deleted = await Notification.query()
        .where('user_id', userId)
        .where('status', 'read')
        .delete();

      logger.info(`Read notifications deleted for user: ${userId}`, {
        userId,
        count: deleted,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: `${deleted} notificações lidas excluídas`,
        data: { deleted_count: deleted }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/user/:userId/count
  async getNotificationCount(req, res, next) {
    try {
      const { userId } = req.params;

      // Check permissions
      if (userId != req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para visualizar contadores deste usuário', 403);
      }

      const total = await Notification.query()
        .where('user_id', userId)
        .count('* as count')
        .first();

      const unread = await Notification.query()
        .where('user_id', userId)
        .where('status', 'unread')
        .count('* as count')
        .first();

      const byType = await Notification.query()
        .select('type')
        .count('* as count')
        .where('user_id', userId)
        .where('status', 'unread')
        .groupBy('type');

      const byPriority = await Notification.query()
        .select('priority')
        .count('* as count')
        .where('user_id', userId)
        .where('status', 'unread')
        .groupBy('priority');

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          unread: parseInt(unread.count),
          byType,
          byPriority
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/stats
  async getNotificationStats(req, res, next) {
    try {
      const total = await Notification.query().count('* as count').first();
      const unread = await Notification.query().where('status', 'unread').count('* as count').first();
      const read = await Notification.query().where('status', 'read').count('* as count').first();

      // By type
      const byType = await Notification.query()
        .select('type')
        .count('* as count')
        .groupBy('type')
        .orderBy('count', 'desc');

      // By priority
      const byPriority = await Notification.query()
        .select('priority')
        .count('* as count')
        .groupBy('priority')
        .orderBy('count', 'desc');

      // Daily notification stats (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const dailyStats = await Notification.query()
        .select(Notification.raw('DATE(created_at) as date'))
        .count('* as count')
        .where('created_at', '>=', weekAgo)
        .groupByRaw('DATE(created_at)')
        .orderBy('date');

      // Most active notification creators
      const topCreators = await Notification.query()
        .select('created_by')
        .count('* as notifications_created')
        .join('users', 'notifications.created_by', 'users.id')
        .select('users.name as creator_name')
        .whereNotNull('created_by')
        .groupBy('created_by', 'users.name')
        .orderBy('notifications_created', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          unread: parseInt(unread.count),
          read: parseInt(read.count),
          byType,
          byPriority,
          dailyStats,
          topCreators
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/types
  async getNotificationTypes(req, res, next) {
    try {
      const types = await Notification.query()
        .distinct('type')
        .orderBy('type');

      res.json({
        success: true,
        data: types.map(t => t.type)
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();