const { Model } = require('objection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2, maxLength: 100 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password: { type: 'string', minLength: 6 },
        role: { 
          type: 'string', 
          enum: ['super_admin', 'admin', 'manager', 'trainer', 'receptionist', 'student'] 
        },
        avatar: { type: 'string', maxLength: 500 },
        phone: { type: 'string', maxLength: 20 },
        dateOfBirth: { type: 'string', format: 'date' },
        gender: { type: 'string', enum: ['male', 'female', 'other'] },
        address: { type: 'object' },
        emergencyContact: { type: 'object' },
        isActive: { type: 'boolean', default: true },
        isEmailVerified: { type: 'boolean', default: false },
        lastLogin: { type: 'string', format: 'date-time' },
        passwordChangedAt: { type: 'string', format: 'date-time' },
        resetPasswordToken: { type: 'string' },
        resetPasswordExpires: { type: 'string', format: 'date-time' },
        emailVerificationToken: { type: 'string' },
        emailVerificationExpires: { type: 'string', format: 'date-time' },
        loginAttempts: { type: 'integer', default: 0 },
        lockUntil: { type: 'string', format: 'date-time' },
        preferences: { type: 'object' },
        metadata: { type: 'object' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    // Relations will be added when other models are created
    return {};
  }

  // Virtuals
  get isLocked() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  }

  get fullName() {
    return this.name;
  }

  get age() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Hooks
  $beforeInsert() {
    const now = new Date();
    this.created_at = now.toISOString().slice(0, 19).replace('T', ' ');
    this.updated_at = now.toISOString().slice(0, 19).replace('T', ' ');
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    
    // Hash password if provided but not already hashed
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await this.hashPassword(this.password);
    }
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    
    if (this.password && opt.patch && opt.patch.password) {
      this.password = await this.hashPassword(this.password);
      const now = new Date();
      this.passwordChangedAt = now.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  // Instance methods
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  generateJWT() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email, 
        role: this.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'academia-api',
        audience: 'academia-users'
      }
    );
  }

  generateRefreshToken() {
    return jwt.sign(
      { 
        id: this.id, 
        type: 'refresh' 
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'academia-api',
        audience: 'academia-users'
      }
    );
  }

  generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return resetToken;
  }

  generateEmailVerificationToken() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    return verificationToken;
  }

  incrementLoginAttempts() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.$query().patch({
        loginAttempts: 1,
        lockUntil: null
      });
    }
    
    const updates = { loginAttempts: this.loginAttempts + 1 };
    
    // Lock account after 5 failed attempts for 2 hours
    if (updates.loginAttempts >= 5 && !this.isLocked) {
      updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
    
    return this.$query().patch(updates);
  }

  resetLoginAttempts() {
    return this.$query().patch({
      loginAttempts: 0,
      lockUntil: null
    });
  }

  // Static methods
  static async findByEmail(email) {
    return this.query().findOne({ email: email.toLowerCase() });
  }

  static async findByResetToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.query()
      .findOne({ resetPasswordToken: hashedToken })
      .where('resetPasswordExpires', '>', new Date());
  }

  static async findByVerificationToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.query()
      .findOne({ emailVerificationToken: hashedToken })
      .where('emailVerificationExpires', '>', new Date());
  }

  // Scopes
  static get modifiers() {
    return {
      active(query) {
        query.where('isActive', true);
      },

      byRole(query, role) {
        query.where('role', role);
      },

      verified(query) {
        query.where('isEmailVerified', true);
      },

      notLocked(query) {
        query.where(builder => {
          builder.whereNull('lockUntil').orWhere('lockUntil', '<', new Date());
        });
      }
    };
  }

  // JSON serialization
  $formatJson(json) {
    json = super.$formatJson(json);
    
    // Remove sensitive data
    delete json.password;
    delete json.resetPasswordToken;
    delete json.resetPasswordExpires;
    delete json.emailVerificationToken;
    delete json.emailVerificationExpires;
    delete json.loginAttempts;
    delete json.lockUntil;
    
    return json;
  }
}

module.exports = User;