/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'success', 'warning', 'error', 'payment', 'workout', 'subscription']).notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.json('metadata').nullable(); // Additional data like links, actions
    table.timestamp('expires_at').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('type');
    table.index('is_read');
    table.index(['user_id', 'is_read']);
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};