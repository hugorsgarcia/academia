const cron = require('node-cron');
const axios = require('axios');
const logger = require('./utils/logger');

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3002}`;
const SCHEDULER_TOKEN = process.env.SCHEDULER_SECRET_TOKEN;

/**
 * Agenda uma tarefa para enviar lembretes de vencimento de assinaturas.
 * A tarefa roda todos os dias às 9:00 da manhã.
 */
const scheduleExpiryReminders = () => {
  // Cron schedule: '0 9 * * *' -> Roda todo dia às 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('SCHEDULER: Iniciando tarefa de envio de lembretes de vencimento.');

    if (!SCHEDULER_TOKEN) {
      logger.error('SCHEDULER: Token de autenticação do agendador não configurado. A tarefa não será executada.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/subscriptions/send-expiry-reminders`,
        {
          days_before: 7 // Enviar lembretes para assinaturas que vencem em 7 dias
        },
        {
          headers: {
            'Authorization': `Bearer ${SCHEDULER_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('SCHEDULER: Tarefa de lembretes de vencimento concluída com sucesso.', { response: response.data });
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      logger.error('SCHEDULER: Erro ao executar a tarefa de lembretes de vencimento.', { error: errorMessage });
    }
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

  logger.info('Scheduler para lembretes de vencimento configurado para rodar diariamente às 09:00.');
};

module.exports = {
  initializeSchedulers: () => {
    scheduleExpiryReminders();
    // Adicione outras tarefas agendadas aqui no futuro
  }
};