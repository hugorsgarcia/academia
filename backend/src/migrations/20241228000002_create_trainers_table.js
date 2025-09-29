/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trainers', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('registration_number', 50).unique().notNullable();
    table.string('cpf', 14).unique().nullable();
    table.string('cref', 20).unique().nullable(); // Professional registration
    table.text('specializations').nullable();
    table.text('bio').nullable();
    table.decimal('hourly_rate', 8, 2).nullable();
    table.enum('status', ['active', 'inactive', 'on_leave']).defaultTo('active');
    table.date('hire_date').defaultTo(knex.raw('(CURDATE())'));
    table.json('availability_schedule').nullable();
    table.json('certifications').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('registration_number');
    table.index('cref');
    table.index('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('trainers');
};