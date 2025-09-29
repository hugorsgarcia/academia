/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('subscription_id').unsigned().references('id').inTable('subscriptions').onDelete('CASCADE').nullable();
    table.string('payment_id', 255).unique().notNullable(); // External payment ID
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('BRL');
    table.enum('payment_method', ['credit_card', 'debit_card', 'pix', 'boleto', 'cash', 'bank_transfer']).notNullable();
    table.enum('payment_gateway', ['stripe', 'mercado_pago', 'pagarme', 'manual']).notNullable();
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).defaultTo('pending');
    table.string('gateway_transaction_id', 255).nullable();
    table.json('gateway_response').nullable();
    table.timestamp('paid_at').nullable();
    table.date('due_date').nullable();
    table.text('description').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('student_id');
    table.index('subscription_id');
    table.index('payment_id');
    table.index('status');
    table.index('payment_gateway');
    table.index('paid_at');
    table.index(['student_id', 'status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};