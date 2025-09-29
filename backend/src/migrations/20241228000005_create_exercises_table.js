/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('exercises', function(table) {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.text('description').nullable();
    table.string('category', 50).notNullable(); // chest, back, legs, shoulders, arms, core, cardio
    table.json('target_muscles').nullable(); // primary and secondary muscles
    table.json('equipment_needed').nullable(); // array of equipment
    table.enum('difficulty_level', ['beginner', 'intermediate', 'advanced']).notNullable();
    table.text('instructions').nullable();
    table.json('media_urls').nullable(); // images, videos
    table.integer('estimated_duration_minutes').nullable();
    table.integer('calories_per_minute').nullable();
    table.json('safety_tips').nullable();
    table.json('variations').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().references('id').inTable('users').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('category');
    table.index('difficulty_level');
    table.index('is_active');
    table.index('name');
    table.index(['category', 'difficulty_level']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('exercises');
};