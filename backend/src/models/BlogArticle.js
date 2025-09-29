const { Model } = require('objection');

class BlogArticle extends Model {
  static get tableName() {
    return 'blog_articles';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'content', 'author_id'],
      properties: {
        id: { type: 'integer' },
        title: { type: 'string', maxLength: 255 },
        slug: { type: 'string', maxLength: 255 },
        excerpt: { type: 'string', maxLength: 500 },
        content: { type: 'string' },
        author_id: { type: 'integer' },
        category: { type: 'string', maxLength: 100 },
        tags: { type: 'array', items: { type: 'string' } },
        featured_image: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'archived'],
          default: 'draft'
        },
        is_featured: { type: 'boolean', default: false },
        views_count: { type: 'integer', default: 0 },
        likes_count: { type: 'integer', default: 0 },
        published_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'blog_articles.author_id',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Generate slug if not provided
    if (!this.slug && this.title) {
      this.slug = this.generateSlug(this.title);
    }
    
    // Generate excerpt if not provided
    if (!this.excerpt && this.content) {
      this.excerpt = this.generateExcerpt(this.content);
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    
    // Update slug if title changed
    if (this.title && (!this.slug || this.slug === '')) {
      this.slug = this.generateSlug(this.title);
    }
    
    // Update excerpt if content changed and excerpt is empty
    if (this.content && (!this.excerpt || this.excerpt === '')) {
      this.excerpt = this.generateExcerpt(this.content);
    }
  }

  // Virtual properties
  get isPublished() {
    return this.status === 'published';
  }

  get isDraft() {
    return this.status === 'draft';
  }

  get isArchived() {
    return this.status === 'archived';
  }

  get readingTime() {
    if (!this.content) return 0;
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  get formattedPublishedDate() {
    if (!this.published_at) return null;
    return new Date(this.published_at).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get formattedTags() {
    if (!this.tags || !Array.isArray(this.tags)) return [];
    return this.tags.map(tag => ({
      name: tag,
      slug: this.generateSlug(tag),
      formatted: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  }

  get url() {
    return `/blog/${this.slug}`;
  }

  get wordCount() {
    if (!this.content) return 0;
    return this.content.split(/\s+/).length;
  }

  // Instance methods
  async publish() {
    if (this.isPublished) {
      throw new Error('Artigo já está publicado');
    }

    return await this.$query().patch({
      status: 'published',
      published_at: new Date().toISOString()
    });
  }

  async unpublish() {
    if (!this.isPublished) {
      throw new Error('Artigo não está publicado');
    }

    return await this.$query().patch({
      status: 'draft'
    });
  }

  async archive() {
    return await this.$query().patch({
      status: 'archived'
    });
  }

  async incrementViews() {
    return await this.$query().increment('views_count', 1);
  }

  async incrementLikes() {
    return await this.$query().increment('likes_count', 1);
  }

  async decrementLikes() {
    if (this.likes_count > 0) {
      return await this.$query().decrement('likes_count', 1);
    }
  }

  async toggleFeatured() {
    return await this.$query().patch({
      is_featured: !this.is_featured
    });
  }

  async updateSlug(newSlug) {
    // Check if slug already exists
    const existing = await BlogArticle.query()
      .where('slug', newSlug)
      .where('id', '!=', this.id)
      .first();

    if (existing) {
      throw new Error('Slug já está em uso');
    }

    return await this.$query().patch({ slug: newSlug });
  }

  // Helper methods
  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }

  generateExcerpt(content, length = 150) {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= length) {
      return plainText;
    }
    
    // Find the last complete word within the length limit
    const truncated = plainText.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substring(0, lastSpace) + '...';
  }

  // Static methods
  static findPublished() {
    return this.query()
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('published_at', 'desc');
  }

  static findByAuthor(authorId) {
    return this.query()
      .where('author_id', authorId)
      .withGraphFetched('author')
      .orderBy('created_at', 'desc');
  }

  static findByCategory(category) {
    return this.query()
      .where('category', category)
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('published_at', 'desc');
  }

  static findByTag(tag) {
    return this.query()
      .whereJsonSupersetOf('tags', [tag])
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('published_at', 'desc');
  }

  static findBySlug(slug) {
    return this.query()
      .where('slug', slug)
      .withGraphFetched('author')
      .first();
  }

  static findFeatured() {
    return this.query()
      .where('is_featured', true)
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('published_at', 'desc');
  }

  static findPopular(limit = 10) {
    return this.query()
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('views_count', 'desc')
      .limit(limit);
  }

  static findRecent(limit = 5) {
    return this.query()
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('published_at', 'desc')
      .limit(limit);
  }

  static searchArticles(query) {
    return this.query()
      .where('status', 'published')
      .where(builder => {
        builder
          .where('title', 'like', `%${query}%`)
          .orWhere('excerpt', 'like', `%${query}%`)
          .orWhere('content', 'like', `%${query}%`)
          .orWhere('category', 'like', `%${query}%`)
          .orWhereJsonSupersetOf('tags', [query]);
      })
      .withGraphFetched('author')
      .orderBy('published_at', 'desc');
  }

  static async getAllCategories() {
    const categories = await this.query()
      .distinct('category')
      .whereNotNull('category')
      .where('status', 'published')
      .orderBy('category');

    return categories.map(c => c.category);
  }

  static async getAllTags() {
    const articles = await this.query()
      .select('tags')
      .where('status', 'published')
      .whereNotNull('tags');

    const tags = new Set();
    articles.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tag => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  }

  static async getBlogStats() {
    const total = await this.query().count('* as count').first();
    const published = await this.query().where('status', 'published').count('* as count').first();
    const draft = await this.query().where('status', 'draft').count('* as count').first();
    const archived = await this.query().where('status', 'archived').count('* as count').first();

    // Views and likes
    const totalViews = await this.query()
      .where('status', 'published')
      .sum('views_count as total')
      .first();

    const totalLikes = await this.query()
      .where('status', 'published')
      .sum('likes_count as total')
      .first();

    // By category
    const byCategory = await this.query()
      .select('category')
      .count('* as count')
      .where('status', 'published')
      .whereNotNull('category')
      .groupBy('category')
      .orderBy('count', 'desc');

    // Monthly publication stats
    const monthlyStats = await this.query()
      .select(this.raw('MONTH(published_at) as month'), this.raw('YEAR(published_at) as year'))
      .count('* as count')
      .where('status', 'published')
      .whereNotNull('published_at')
      .groupByRaw('YEAR(published_at), MONTH(published_at)')
      .orderByRaw('YEAR(published_at) DESC, MONTH(published_at) DESC')
      .limit(12);

    // Top authors
    const topAuthors = await this.query()
      .select('author_id')
      .count('* as articles_count')
      .sum('views_count as total_views')
      .join('users', 'blog_articles.author_id', 'users.id')
      .select('users.name as author_name')
      .where('blog_articles.status', 'published')
      .groupBy('author_id', 'users.name')
      .orderBy('articles_count', 'desc')
      .limit(5);

    // Most viewed articles
    const mostViewed = await this.query()
      .where('status', 'published')
      .withGraphFetched('author')
      .orderBy('views_count', 'desc')
      .limit(5);

    return {
      counts: {
        total: parseInt(total.count),
        published: parseInt(published.count),
        draft: parseInt(draft.count),
        archived: parseInt(archived.count)
      },
      engagement: {
        totalViews: parseInt(totalViews.total) || 0,
        totalLikes: parseInt(totalLikes.total) || 0
      },
      byCategory,
      monthlyStats,
      topAuthors,
      mostViewed
    };
  }

  static async generateUniqueSlug(baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      let query = this.query().where('slug', slug);
      
      if (excludeId) {
        query = query.where('id', '!=', excludeId);
      }

      const existing = await query.first();
      
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async getRelatedArticles(articleId, limit = 3) {
    const article = await this.query().findById(articleId);
    if (!article) return [];

    // Find articles with similar tags or same category
    let query = this.query()
      .where('status', 'published')
      .where('id', '!=', articleId);

    if (article.category) {
      query = query.where('category', article.category);
    }

    if (article.tags && article.tags.length > 0) {
      query = query.orWhere(builder => {
        article.tags.forEach(tag => {
          builder.orWhereJsonSupersetOf('tags', [tag]);
        });
      });
    }

    return await query
      .withGraphFetched('author')
      .orderBy('published_at', 'desc')
      .limit(limit);
  }
}

module.exports = BlogArticle;