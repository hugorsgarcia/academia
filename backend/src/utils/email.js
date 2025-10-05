const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email templates
const templates = {
  emailVerification: {
    subject: 'Verificação de E-mail - Academia',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo à Academia!</h2>
        <p>Olá ${data.name},</p>
        <p>Obrigado por se cadastrar em nossa academia. Para ativar sua conta, clique no link abaixo:</p>
        <a href="${data.verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verificar E-mail
        </a>
        <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
        <p>${data.verificationUrl}</p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não se cadastrou em nossa academia, ignore este e-mail.</p>
      </div>
    `
  },
  passwordReset: {
    subject: 'Redefinição de Senha - Academia',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Redefinição de Senha</h2>
        <p>Olá ${data.name},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${data.resetUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
        <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
        <p>${data.resetUrl}</p>
        <p>Este link expira em 10 minutos.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
      </div>
    `
  },
  paymentConfirmation: {
    subject: 'Pagamento Confirmado - Academia',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Pagamento Confirmado!</h2>
        <p>Olá ${data.name},</p>
        <p>Seu pagamento foi processado com sucesso!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Detalhes do Pagamento:</h3>
          <p><strong>Valor:</strong> R$ ${data.amount}</p>
          <p><strong>Plano:</strong> ${data.planName}</p>
          <p><strong>Data:</strong> ${data.paymentDate}</p>
          <p><strong>Método:</strong> ${data.paymentMethod}</p>
        </div>
        <p>Sua mensalidade está em dia até ${data.expiresAt}.</p>
        <p>Obrigado por fazer parte da nossa academia!</p>
      </div>
    `
  },
  membershipExpiring: {
    subject: 'Sua Mensalidade Vence em Breve - Academia',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Lembrete de Vencimento</h2>
        <p>Olá ${data.name},</p>
        <p>Sua mensalidade vence em ${data.daysUntilExpiry} dias (${data.expiryDate}).</p>
        <p>Para continuar aproveitando todos os benefícios da academia, renove sua mensalidade:</p>
        <a href="${data.renewUrl}" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Renovar Mensalidade
        </a>
        <p>Se você já renovou, ignore este e-mail.</p>
      </div>
    `
  },
  welcome: {
    subject: 'Bem-vindo(a) à Academia!',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo(a), ${data.name}!</h2>
        <p>Sua conta foi criada com sucesso. Estamos muito felizes em ter você conosco!</p>
        <p>Seu acesso à plataforma já está liberado. Explore seus treinos, acompanhe seu progresso e não hesite em falar com nossos instrutores.</p>
        <a href="${data.loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Acessar Minha Conta
        </a>
        <p>Bons treinos!</p>
        <p><strong>Equipe Academia</strong></p>
      </div>
    `
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const { to, subject, template, data, html, text } = options;
    
    let emailHtml = html;
    let emailSubject = subject;
    
    // Use template if provided
    if (template && templates[template]) {
      emailHtml = templates[template].html(data);
      emailSubject = emailSubject || templates[template].subject;
    }
    
    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME || 'Academia'} <${process.env.MAIL_FROM}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
      text: text || emailHtml?.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      to,
      subject: emailSubject,
      messageId: result.messageId,
      template
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to send email', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      error: error.message
    });
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, options) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        ...options,
        to: recipient.email,
        data: { ...options.data, ...recipient }
      });
      results.push({ email: recipient.email, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  
  return results;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed', { error: error.message });
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  verifyEmailConfig,
  templates
};