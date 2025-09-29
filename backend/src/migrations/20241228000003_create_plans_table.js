/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('plans', function(table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('duration_days').notNullable(); // Plan duration in days
    table.enum('type', ['monthly', 'quarterly', 'semi_annual', 'annual', 'daily', 'custom']).notNullable();
    table.json('features').nullable(); // Array of features included
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_popular').defaultTo(false);
    table.integer('max_students').nullable(); // null = unlimited
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.integer('trial_days').defaultTo(0);
    table.json('access_permissions').nullable(); // What the plan allows access to
    table.timestamps(true, true);
    
    // Indexes
    table.index('is_active');
    table.index('type');
    table.index('price');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('plans');
};