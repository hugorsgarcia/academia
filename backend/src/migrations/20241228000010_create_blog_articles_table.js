/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('blog_articles', function(table) {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).unique().notNullable();
    table.text('excerpt').nullable();
    table.longText('content').notNullable();
    table.string('featured_image', 500).nullable();
    table.string('category', 100).notNullable();
    table.json('tags').nullable();
    table.enum('status', ['draft', 'published', 'scheduled', 'archived']).defaultTo('draft');
    table.timestamp('publish_date').nullable();
    table.string('meta_description', 160).nullable();
    table.string('meta_keywords', 255).nullable();
    table.integer('views_count').defaultTo(0);
    table.integer('likes_count').defaultTo(0);
    table.integer('author_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
    table.json('seo_data').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('slug');
    table.index('status');
    table.index('category');
    table.index('author_id');
    table.index('publish_date');
    table.index(['status', 'publish_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('blog_articles');
};