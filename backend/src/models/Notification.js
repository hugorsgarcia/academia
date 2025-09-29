const { Model } = require('objection');

class Notification extends Model {
  static get tableName() {
    return 'notifications';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['recipient_id', 'type', 'title', 'message'],
      properties: {
        id: { type: 'integer' },
        recipient_id: { type: 'integer' },
        type: {
          type: 'string',
          enum: [
            'system',
            'payment',
            'workout',
            'checkin', 
            'subscription',
            'announcement',
            'reminder',
            'welcome',
            'achievement',
            'schedule',
            'promotion'
          ]
        },
        title: { type: 'string', maxLength: 255 },
        message: { type: 'string' },
        data: { type: 'object' }, // Additional data payload
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'urgent'],
          default: 'normal'
        },
        channel: {
          type: 'string',
          enum: ['in_app', 'email', 'sms', 'push'],
          default: 'in_app'
        },
        is_read: { type: 'boolean', default: false },
        is_sent: { type: 'boolean', default: false },
        sent_at: { type: 'string', format: 'date-time' },
        read_at: { type: 'string', format: 'date-time' },
        expires_at: { type: 'string', format: 'date-time' },
        action_url: { type: 'string' },
        action_text: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'notifications.recipient_id',
          to: 'users.id'
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
  get isUnread() {
    return !this.is_read;
  }

  get isExpired() {
    if (!this.expires_at) return false;
    return new Date(this.expires_at) < new Date();
  }

  get isUrgent() {
    return this.priority === 'urgent';
  }

  get isHigh() {
    return this.priority === 'high';
  }

  get timeAgo() {
    const now = new Date();
    const created = new Date(this.created_at);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}sem atrás`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m atrás`;
  }

  get formattedCreatedAt() {
    return new Date(this.created_at).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get priorityColor() {
    const colors = {
      low: '#6b7280',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[this.priority] || colors.normal;
  }

  get typeIcon() {
    const icons = {
      system: '⚙️',
      payment: '💳',
      workout: '💪',
      checkin: '📍', 
      subscription: '📋',
      announcement: '📢',
      reminder: '⏰',
      welcome: '👋',
      achievement: '🏆',
      schedule: '📅',
      promotion: '🎉'
    };
    return icons[this.type] || '📝';
  }

  get channelDisplay() {
    const displays = {
      in_app: 'No App',
      email: 'E-mail',
      sms: 'SMS',
      push: 'Push'
    };
    return displays[this.channel] || 'No App';
  }

  // Instance methods
  async markAsRead() {
    if (this.is_read) return this;

    return await this.$query().patch({
      is_read: true,
      read_at: new Date().toISOString()
    });
  }

  async markAsUnread() {
    if (!this.is_read) return this;

    return await this.$query().patch({
      is_read: false,
      read_at: null
    });
  }

  async markAsSent() {
    if (this.is_sent) return this;

    return await this.$query().patch({
      is_sent: true,
      sent_at: new Date().toISOString()
    });
  }

  async setExpiration(expirationDate) {
    return await this.$query().patch({
      expires_at: expirationDate.toISOString()
    });
  }

  async updateData(newData) {
    const updatedData = { ...this.data, ...newData };
    return await this.$query().patch({ data: updatedData });
  }

  async duplicate(recipientId) {
    const notification = {
      recipient_id: recipientId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      priority: this.priority,
      channel: this.channel,
      expires_at: this.expires_at,
      action_url: this.action_url,
      action_text: this.action_text
    };

    return await Notification.query().insert(notification);
  }

  // Static methods
  static findByRecipient(recipientId) {
    return this.query()
      .where('recipient_id', recipientId)
      .orderBy('created_at', 'desc');
  }

  static findUnread(recipientId) {
    return this.query()
      .where('recipient_id', recipientId)
      .where('is_read', false)
      .where(builder => {
        builder.whereNull('expires_at').orWhere('expires_at', '>', new Date().toISOString());
      })
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'desc');
  }

  static findByType(type, recipientId = null) {
    let query = this.query().where('type', type);
    
    if (recipientId) {
      query = query.where('recipient_id', recipientId);
    }

    return query.orderBy('created_at', 'desc');
  }

  static findByPriority(priority, recipientId = null) {
    let query = this.query().where('priority', priority);
    
    if (recipientId) {
      query = query.where('recipient_id', recipientId);
    }

    return query.orderBy('created_at', 'desc');
  }

  static findUrgent(recipientId = null) {
    return this.findByPriority('urgent', recipientId);
  }

  static findRecent(recipientId, limit = 10) {
    return this.query()
      .where('recipient_id', recipientId)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  static async getUnreadCount(recipientId) {
    const result = await this.query()
      .where('recipient_id', recipientId)
      .where('is_read', false)
      .where(builder => {
        builder.whereNull('expires_at').orWhere('expires_at', '>', new Date().toISOString());
      })
      .count('* as count')
      .first();

    return parseInt(result.count);
  }

  static async markAllAsRead(recipientId) {
    return await this.query()
      .where('recipient_id', recipientId)
      .where('is_read', false)
      .patch({
        is_read: true,
        read_at: new Date().toISOString()
      });
  }

  static async deleteRead(recipientId, olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return await this.query()
      .where('recipient_id', recipientId)
      .where('is_read', true)
      .where('read_at', '<', cutoffDate.toISOString())
      .delete();
  }

  static async deleteExpired() {
    return await this.query()
      .where('expires_at', '<', new Date().toISOString())
      .delete();
  }

  // Factory methods for common notification types
  static async createPaymentNotification(recipientId, paymentData) {
    const { amount, status, method, dueDate } = paymentData;
    
    let title, message, priority = 'normal';
    
    switch (status) {
      case 'overdue':
        title = 'Pagamento em Atraso';
        message = `Seu pagamento de R$ ${amount} está em atraso. Regularize sua situação.`;
        priority = 'high';
        break;
      case 'due_soon':
        title = 'Pagamento Próximo ao Vencimento';
        message = `Seu pagamento de R$ ${amount} vence em breve (${new Date(dueDate).toLocaleDateString('pt-BR')}).`;
        priority = 'normal';
        break;
      case 'processed':
        title = 'Pagamento Processado';
        message = `Seu pagamento de R$ ${amount} via ${method} foi processado com sucesso.`;
        priority = 'normal';
        break;
      default:
        title = 'Atualização de Pagamento';
        message = `Status do seu pagamento foi atualizado para: ${status}`;
    }

    return await this.query().insert({
      recipient_id: recipientId,
      type: 'payment',
      title,
      message,
      priority,
      data: paymentData,
      action_url: '/aluno/pagamentos',
      action_text: 'Ver Pagamentos'
    });
  }

  static async createWorkoutNotification(recipientId, workoutData) {
    const { workoutName, scheduledFor, type = 'reminder' } = workoutData;
    
    let title, message;
    
    if (type === 'reminder') {
      title = 'Lembrete de Treino';
      message = `Não esqueça do seu treino "${workoutName}" agendado para ${new Date(scheduledFor).toLocaleDateString('pt-BR')}.`;
    } else if (type === 'completed') {
      title = 'Treino Concluído';
      message = `Parabéns! Você concluiu o treino "${workoutName}".`;
    } else if (type === 'assigned') {
      title = 'Novo Treino Atribuído';
      message = `Um novo treino "${workoutName}" foi atribuído para você.`;
    }

    return await this.query().insert({
      recipient_id: recipientId,
      type: 'workout',
      title,
      message,
      data: workoutData,
      action_url: '/aluno/treinos',
      action_text: 'Ver Treinos'
    });
  }

  static async createCheckinNotification(recipientId, checkinData) {
    const { location, checkinTime, type = 'success' } = checkinData;
    
    let title, message;
    
    if (type === 'success') {
      title = 'Check-in Realizado';
      message = `Check-in realizado com sucesso em ${location} às ${new Date(checkinTime).toLocaleTimeString('pt-BR')}.`;
    } else if (type === 'reminder') {
      title = 'Lembrete de Check-in';
      message = `Não esqueça de fazer seu check-in quando chegar na academia.`;
    }

    return await this.query().insert({
      recipient_id: recipientId,
      type: 'checkin',
      title,
      message,
      data: checkinData,
      action_url: '/aluno/checkins',
      action_text: 'Ver Check-ins'
    });
  }

  static async createSubscriptionNotification(recipientId, subscriptionData) {
    const { planName, status, expiresAt, type = 'status_change' } = subscriptionData;
    
    let title, message, priority = 'normal';
    
    switch (type) {
      case 'expiring_soon':
        title = 'Plano Expirando';
        message = `Seu plano "${planName}" expira em breve (${new Date(expiresAt).toLocaleDateString('pt-BR')}).`;
        priority = 'high';
        break;
      case 'expired':
        title = 'Plano Expirado';
        message = `Seu plano "${planName}" expirou. Renove para continuar aproveitando os benefícios.`;
        priority = 'urgent';
        break;
      case 'renewed':
        title = 'Plano Renovado';
        message = `Seu plano "${planName}" foi renovado com sucesso.`;
        break;
      case 'suspended':
        title = 'Plano Suspenso';
        message = `Seu plano "${planName}" foi suspenso. Entre em contato conosco.`;
        priority = 'high';
        break;
      default:
        title = 'Atualização do Plano';
        message = `Status do seu plano "${planName}" foi atualizado para: ${status}`;
    }

    return await this.query().insert({
      recipient_id: recipientId,
      type: 'subscription',
      title,
      message,
      priority,
      data: subscriptionData,
      action_url: '/aluno/planos',
      action_text: 'Ver Planos'
    });
  }

  static async createWelcomeNotification(recipientId, userData) {
    const { name } = userData;
    
    return await this.query().insert({
      recipient_id: recipientId,
      type: 'welcome',
      title: 'Bem-vindo(a)!',
      message: `Olá ${name}! Bem-vindo(a) à nossa academia. Estamos animados para te ajudar a alcançar seus objetivos fitness.`,
      data: userData,
      action_url: '/aluno/dashboard',
      action_text: 'Explorar Dashboard'
    });
  }

  static async createAchievementNotification(recipientId, achievementData) {
    const { title: achievementTitle, description, badgeUrl } = achievementData;
    
    return await this.query().insert({
      recipient_id: recipientId,
      type: 'achievement',
      title: 'Nova Conquista Desbloqueada!',
      message: `Parabéns! Você desbloqueou a conquista "${achievementTitle}": ${description}`,
      data: { ...achievementData, badge_url: badgeUrl },
      action_url: '/aluno/conquistas',
      action_text: 'Ver Conquistas'
    });
  }

  static async createAnnouncementNotification(title, message, data = {}) {
    // Get all active users
    const User = require('./User');
    const activeUsers = await User.query()
      .where('status', 'active')
      .select('id');

    // Create notification for each user
    const notifications = activeUsers.map(user => ({
      recipient_id: user.id,
      type: 'announcement',
      title,
      message,
      data,
      priority: data.priority || 'normal'
    }));

    return await this.query().insert(notifications);
  }

  static async createBulkNotifications(notifications) {
    return await this.query().insert(notifications);
  }

  // Analytics and reporting
  static async getNotificationStats(recipientId = null) {
    let baseQuery = this.query();
    
    if (recipientId) {
      baseQuery = baseQuery.where('recipient_id', recipientId);
    }

    const total = await baseQuery.clone().count('* as count').first();
    const unread = await baseQuery.clone().where('is_read', false).count('* as count').first();
    const sent = await baseQuery.clone().where('is_sent', true).count('* as count').first();

    // By type
    const byType = await baseQuery.clone()
      .select('type')
      .count('* as count')
      .groupBy('type')
      .orderBy('count', 'desc');

    // By priority
    const byPriority = await baseQuery.clone()
      .select('priority')
      .count('* as count')
      .groupBy('priority')
      .orderBy('count', 'desc');

    // Daily stats for last 30 days
    const dailyStats = await baseQuery.clone()
      .select(this.raw('DATE(created_at) as date'))
      .count('* as count')
      .where('created_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'desc');

    return {
      counts: {
        total: parseInt(total.count),
        unread: parseInt(unread.count),
        sent: parseInt(sent.count),
        readRate: total.count > 0 ? ((total.count - unread.count) / total.count * 100).toFixed(1) : 0
      },
      byType,
      byPriority,
      dailyStats
    };
  }

  static async cleanupExpiredNotifications() {
    const deleted = await this.deleteExpired();
    return { deletedCount: deleted };
  }

  static async getTopUsers(limit = 10) {
    return await this.query()
      .select('recipient_id')
      .count('* as notification_count')
      .join('users', 'notifications.recipient_id', 'users.id')
      .select('users.name', 'users.email')
      .groupBy('recipient_id', 'users.name', 'users.email')
      .orderBy('notification_count', 'desc')
      .limit(limit);
  }
}

module.exports = Notification;