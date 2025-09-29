/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('workout_exercises', function(table) {
    table.increments('id').primary();
    table.integer('workout_id').unsigned().references('id').inTable('workouts').onDelete('CASCADE');
    table.integer('exercise_id').unsigned().references('id').inTable('exercises').onDelete('CASCADE');
    table.integer('order_in_workout').notNullable();
    table.integer('sets').nullable();
    table.string('reps', 50).nullable(); // Can be "10-12", "30 seconds", etc.
    table.string('weight', 50).nullable(); // Can be "bodyweight", "10kg", etc.
    table.string('rest_duration', 50).nullable(); // "60 seconds", "2 minutes"
    table.text('notes').nullable();
    table.boolean('is_completed').defaultTo(false);
    table.json('performance_data').nullable(); // Actual reps, weight used, etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index('workout_id');
    table.index('exercise_id');
    table.index(['workout_id', 'order_in_workout']);
    table.unique(['workout_id', 'exercise_id', 'order_in_workout']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('workout_exercises');
};