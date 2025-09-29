/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enum('role', ['super_admin', 'admin', 'manager', 'trainer', 'receptionist', 'student']).notNullable();
    table.string('avatar', 500).nullable();
    table.string('phone', 20).nullable();
    table.date('dateOfBirth').nullable();
    table.enum('gender', ['male', 'female', 'other']).nullable();
    table.json('address').nullable();
    table.json('emergencyContact').nullable();
    table.boolean('isActive').defaultTo(true);
    table.boolean('isEmailVerified').defaultTo(false);
    table.timestamp('lastLogin').nullable();
    table.timestamp('passwordChangedAt').nullable();
    table.string('resetPasswordToken', 255).nullable();
    table.timestamp('resetPasswordExpires').nullable();
    table.string('emailVerificationToken', 255).nullable();
    table.timestamp('emailVerificationExpires').nullable();
    table.integer('loginAttempts').defaultTo(0);
    table.timestamp('lockUntil').nullable();
    table.json('preferences').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('role');
    table.index('isActive');
    table.index(['email', 'isActive']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};