# Academia Backend API

## 🎯 Sistema Completo de Gerenciamento de Academia

Backend robusto desenvolvido com Node.js, Express, MySQL e integrações completas para gerenciamento de academias.

## 🚀 Funcionalidades

### 🔐 **Autenticação & Autorização**
- JWT com refresh tokens
- Roles: Admin, Instrutor, Recepcionista, Aluno
- Middleware de proteção de rotas
- Rate limiting por usuário

### 👥 **Gestão de Usuários**
- CRUD completo de alunos, instrutores e staff
- Upload de fotos e documentos
- Sistema de perfis detalhados
- Histórico de atividades

### 💪 **Sistema de Treinos**
- Biblioteca de exercícios com mídia
- Criação de treinos personalizados
- Atribuição de treinos a alunos
- Acompanhamento de progresso

### 💳 **Pagamentos Integrados**
- Stripe para cartões internacionais
- Mercado Pago para PIX e cartões brasileiros
- Pagar.me como alternativa
- Webhooks para atualização automática
- Relatórios financeiros

### 📱 **Check-in & Frequência**
- QR Code para check-in
- Controle de acesso
- Relatórios de frequência
- Notificações automáticas

### 📊 **Dashboard & Relatórios**
- Métricas em tempo real
- Relatórios de inadimplência
- Análise de frequência
- Indicadores financeiros

### 📝 **Blog & Conteúdo**
- Sistema completo de artigos
- Categorização e tags
- SEO otimizado
- Sistema de comentários

### 🔔 **Notificações**
- E-mail e SMS via Twilio
- Notificações push
- Lembretes automáticos
- Sistema de templates

## 🛠 **Stack Tecnológica**

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Banco de Dados**: MySQL 8.0+
- **ORM**: Knex.js + Objection.js
- **Cache**: Redis
- **Autenticação**: JWT
- **Validação**: Joi
- **Upload**: Multer + AWS S3
- **Pagamentos**: Stripe, Mercado Pago, Pagar.me
- **Comunicação**: Nodemailer, Twilio
- **Logs**: Winston
- **Testes**: Jest + Supertest
- **Linting**: ESLint + Prettier

## 🏗 **Estrutura do Projeto**

```
src/
├── config/           # Configurações da aplicação
├── controllers/      # Controladores das rotas
├── middleware/       # Middlewares customizados
├── models/          # Modelos do banco de dados
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── repositories/    # Camada de acesso aos dados
├── utils/           # Utilitários e helpers
├── validations/     # Schemas de validação
├── migrations/      # Migrações do banco
├── seeds/           # Seeds para dados iniciais
└── tests/           # Testes automatizados
```

## 🚀 **Instalação e Configuração**

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configurar Banco de Dados
```bash
# Executar migrações
npm run migrate

# Popular dados iniciais
npm run seed
```

### 4. Iniciar Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 **Variáveis de Ambiente**

```env
# Aplicação
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=academia_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=academia-uploads

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# Pagar.me
PAGARME_API_KEY=
PAGARME_ENCRYPTION_KEY=

# E-mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@academia.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 📚 **API Endpoints**

### 🔐 **Autenticação**
```
POST   /api/auth/login           # Login
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/logout          # Logout
POST   /api/auth/forgot-password # Esqueci senha
POST   /api/auth/reset-password  # Resetar senha
```

### 👥 **Usuários**
```
GET    /api/users               # Listar usuários
POST   /api/users               # Criar usuário
GET    /api/users/:id           # Obter usuário
PUT    /api/users/:id           # Atualizar usuário
DELETE /api/users/:id           # Deletar usuário
POST   /api/users/:id/avatar    # Upload avatar
```

### 🏋️ **Alunos**
```
GET    /api/students            # Listar alunos
POST   /api/students            # Criar aluno
GET    /api/students/:id        # Obter aluno
PUT    /api/students/:id        # Atualizar aluno
DELETE /api/students/:id        # Deletar aluno
GET    /api/students/:id/workouts # Treinos do aluno
```

### 🎯 **Treinos**
```
GET    /api/workouts            # Listar treinos
POST   /api/workouts            # Criar treino
GET    /api/workouts/:id        # Obter treino
PUT    /api/workouts/:id        # Atualizar treino
DELETE /api/workouts/:id        # Deletar treino
```

### 🏃 **Exercícios**
```
GET    /api/exercises           # Listar exercícios
POST   /api/exercises           # Criar exercício
GET    /api/exercises/:id       # Obter exercício
PUT    /api/exercises/:id       # Atualizar exercício
DELETE /api/exercises/:id       # Deletar exercício
```

### 💰 **Pagamentos**
```
GET    /api/payments            # Listar pagamentos
POST   /api/payments            # Criar pagamento
GET    /api/payments/:id        # Obter pagamento
POST   /api/payments/webhook    # Webhook pagamentos
```

### 📱 **Check-ins**
```
GET    /api/checkins            # Listar check-ins
POST   /api/checkins            # Fazer check-in
GET    /api/checkins/:id        # Obter check-in
GET    /api/checkins/student/:id # Check-ins do aluno
```

## 🧪 **Testes**

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## 🐳 **Docker**

```bash
# Construir imagem
npm run docker:build

# Executar com docker-compose
npm run docker:run
```

## 📈 **Monitoramento**

- **Logs**: Winston com rotação automática
- **Métricas**: Endpoint `/health` para health checks
- **Performance**: Middleware de monitoramento
- **Erros**: Sistema centralizado de tratamento

## 🔒 **Segurança**

- Helmet para headers de segurança
- Rate limiting configurável
- Validação rigorosa de dados
- Sanitização de inputs
- CORS configurado
- Logs de auditoria

## 🚀 **Deploy**

### Heroku
```bash
git push heroku main
```

### AWS/DigitalOcean
```bash
docker-compose up -d
```

## 📞 **Suporte**

Para dúvidas e suporte, entre em contato:
- Email: dev@academia.com
- Discord: [Link do Discord]

---

**Desenvolvido com ❤️ para revolucionar o gerenciamento de academias**