/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('plan_id').unsigned().references('id').inTable('plans').onDelete('RESTRICT');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.enum('status', ['active', 'expired', 'cancelled', 'suspended', 'pending']).defaultTo('pending');
    table.decimal('amount_paid', 10, 2).notNullable();
    table.decimal('discount_applied', 10, 2).defaultTo(0);
    table.integer('remaining_days').nullable();
    table.boolean('auto_renew').defaultTo(false);
    table.date('cancellation_date').nullable();
    table.text('cancellation_reason').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('student_id');
    table.index('plan_id');
    table.index('status');
    table.index(['student_id', 'status']);
    table.index(['start_date', 'end_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};