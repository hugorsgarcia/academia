/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('workouts', function(table) {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.text('description').nullable();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('trainer_id').unsigned().references('id').inTable('trainers').onDelete('SET NULL').nullable();
    table.enum('type', ['strength', 'cardio', 'functional', 'flexibility', 'mixed']).notNullable();
    table.enum('difficulty_level', ['beginner', 'intermediate', 'advanced']).notNullable();
    table.integer('estimated_duration_minutes').notNullable();
    table.integer('estimated_calories').nullable();
    table.json('goals').nullable(); // weight_loss, muscle_gain, strength, endurance
    table.date('workout_date').nullable();
    table.enum('status', ['draft', 'active', 'completed', 'skipped']).defaultTo('draft');
    table.text('notes').nullable();
    table.json('ai_generated_metadata').nullable(); // Store AI generation info
    table.timestamps(true, true);
    
    // Indexes
    table.index('student_id');
    table.index('trainer_id');
    table.index('type');
    table.index('status');
    table.index('workout_date');
    table.index(['student_id', 'status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('workouts');
};