/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('checkins', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.timestamp('checkin_time').defaultTo(knex.fn.now());
    table.timestamp('checkout_time').nullable();
    table.string('entry_method', 50).defaultTo('manual'); // manual, qr_code, rfid
    table.string('location', 100).nullable(); // gym area/zone
    table.integer('duration_minutes').nullable();
    table.text('notes').nullable();
    table.json('metadata').nullable(); // Additional data like QR code used, etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index('student_id');
    table.index('checkin_time');
    table.index(['student_id', 'checkin_time']);
    table.index('entry_method');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('checkins');
};