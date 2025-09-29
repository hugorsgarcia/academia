/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('students', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('registration_number', 50).unique().notNullable();
    table.string('cpf', 14).unique().nullable();
    table.date('birth_date').nullable();
    table.string('phone', 20).nullable();
    table.string('emergency_contact_name', 100).nullable();
    table.string('emergency_contact_phone', 20).nullable();
    table.text('address').nullable();
    table.text('medical_conditions').nullable();
    table.text('fitness_goals').nullable();
    table.enum('status', ['active', 'inactive', 'suspended', 'pending']).defaultTo('pending');
    table.date('enrollment_date').defaultTo(knex.raw('(CURDATE())'));
    table.json('body_measurements').nullable();
    table.json('preferences').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('registration_number');
    table.index('cpf');
    table.index('status');
    table.index('enrollment_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('students');
};