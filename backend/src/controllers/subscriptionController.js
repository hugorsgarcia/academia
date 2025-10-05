const Subscription = require('../models/Subscription');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

class SubscriptionController {
  // POST /api/subscriptions/send-expiry-reminders
  async sendExpiryReminders(req, res, next) {
    try {
      const daysBefore = parseInt(req.body.days_before) || 7;

      const expiringSubscriptions = await Subscription.findExpiringSoon(daysBefore);

      if (expiringSubscriptions.length === 0) {
        return res.json({
          success: true,
          message: 'Nenhuma assinatura expirando em breve.',
          data: { sent_count: 0 }
        });
      }

      let sentCount = 0;
      for (const sub of expiringSubscriptions) {
        try {
          await sendEmail({
            to: sub.student.user.email,
            template: 'membershipExpiring',
            data: {
              name: sub.student.user.name,
              daysUntilExpiry: sub.daysRemaining,
              expiryDate: new Date(sub.end_date).toLocaleDateString('pt-BR'),
              renewUrl: `${process.env.FRONTEND_URL}/aluno/planos`
            }
          });
          sentCount++;
        } catch (emailError) {
          logger.error('Failed to send expiry reminder email', { subscriptionId: sub.id, error: emailError.message });
        }
      }

      logger.info(`${sentCount} membership expiry reminders sent.`);

      res.json({ success: true, message: `${sentCount} lembretes de vencimento enviados.`, data: { sent_count: sentCount } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();