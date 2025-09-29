const BlogArticle = require('../models/BlogArticle');
const User = require('../models/User');
const { AppError } = require('../utils/appError');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class BlogController {
  // GET /api/blog
  async getAllArticles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const category = req.query.category;
      const search = req.query.search;
      const author_id = req.query.author_id;

      let query = BlogArticle.query()
        .withGraphFetched('author')
        .orderBy('created_at', 'desc');

      // Apply filters
      if (status) {
        query = query.where('status', status);
      } else {
        // Default to published articles for public access
        query = query.where('status', 'published');
      }

      if (category) {
        query = query.where('category', category);
      }

      if (author_id) {
        query = query.where('author_id', author_id);
      }

      // Search functionality
      if (search) {
        query = query.where(builder => {
          builder
            .where('title', 'like', `%${search}%`)
            .orWhere('excerpt', 'like', `%${search}%`)
            .orWhere('content', 'like', `%${search}%`)
            .orWhereJsonSupersetOf('tags', [search]);
        });
      }

      const total = await query.resultSize();
      const articles = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: articles.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/:id
  async getArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await BlogArticle.query()
        .findById(id)
        .withGraphFetched('author');

      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Only show published articles to non-admin users
      if (article.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Increment views count
      await BlogArticle.query()
        .findById(id)
        .increment('views_count', 1);

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/slug/:slug
  async getArticleBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const article = await BlogArticle.query()
        .where('slug', slug)
        .withGraphFetched('author')
        .first();

      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Only show published articles to non-admin users
      if (article.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Increment views count
      await BlogArticle.query()
        .findById(article.id)
        .increment('views_count', 1);

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/blog
  async createArticle(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const articleData = {
        ...req.body,
        author_id: req.user.id,
        slug: this.generateSlug(req.body.title),
        views_count: 0,
        likes_count: 0
      };

      // Check if slug already exists
      const existingArticle = await BlogArticle.query()
        .where('slug', articleData.slug)
        .first();

      if (existingArticle) {
        articleData.slug = `${articleData.slug}-${Date.now()}`;
      }

      const article = await BlogArticle.query().insert(articleData);

      // Fetch complete article
      const completeArticle = await BlogArticle.query()
        .findById(article.id)
        .withGraphFetched('author');

      logger.info(`Blog article created: ${article.title}`, {
        articleId: article.id,
        authorId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Artigo criado com sucesso',
        data: completeArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/blog/:id
  async updateArticle(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;

      const article = await BlogArticle.query().findById(id);
      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Check permissions - only author or admin can edit
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para editar este artigo', 403);
      }

      // Update slug if title changed
      if (updateData.title && updateData.title !== article.title) {
        const newSlug = this.generateSlug(updateData.title);
        const existingSlug = await BlogArticle.query()
          .where('slug', newSlug)
          .where('id', '!=', id)
          .first();

        updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug;
      }

      const updatedArticle = await BlogArticle.query()
        .patchAndFetchById(id, updateData)
        .withGraphFetched('author');

      logger.info(`Blog article updated: ${updatedArticle.title}`, {
        articleId: id,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Artigo atualizado com sucesso',
        data: updatedArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/blog/:id
  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await BlogArticle.query().findById(id);
      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Check permissions - only author or admin can delete
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para excluir este artigo', 403);
      }

      await BlogArticle.query().deleteById(id);

      logger.info(`Blog article deleted: ${article.title}`, {
        articleId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Artigo excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/blog/:id/publish
  async publishArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await BlogArticle.query().findById(id);
      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Check permissions
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para publicar este artigo', 403);
      }

      const updatedArticle = await BlogArticle.query()
        .patchAndFetchById(id, {
          status: 'published',
          published_at: new Date()
        })
        .withGraphFetched('author');

      logger.info(`Blog article published: ${article.title}`, {
        articleId: id,
        publishedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Artigo publicado com sucesso',
        data: updatedArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/blog/:id/unpublish
  async unpublishArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await BlogArticle.query().findById(id);
      if (!article) {
        throw new AppError('Artigo não encontrado', 404);
      }

      // Check permissions
      if (article.author_id !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Sem permissão para despublicar este artigo', 403);
      }

      const updatedArticle = await BlogArticle.query()
        .patchAndFetchById(id, { status: 'draft' })
        .withGraphFetched('author');

      logger.info(`Blog article unpublished: ${article.title}`, {
        articleId: id,
        unpublishedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Artigo despublicado com sucesso',
        data: updatedArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/categories
  async getCategories(req, res, next) {
    try {
      const categories = await BlogArticle.query()
        .distinct('category')
        .whereNotNull('category')
        .where('status', 'published')
        .orderBy('category');

      res.json({
        success: true,
        data: categories.map(c => c.category)
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/tags
  async getTags(req, res, next) {
    try {
      const articles = await BlogArticle.query()
        .select('tags')
        .where('status', 'published')
        .whereNotNull('tags');

      const tags = new Set();
      articles.forEach(article => {
        if (article.tags) {
          article.tags.forEach(tag => tags.add(tag));
        }
      });

      res.json({
        success: true,
        data: Array.from(tags).sort()
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/popular
  async getPopularArticles(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const articles = await BlogArticle.query()
        .where('status', 'published')
        .withGraphFetched('author')
        .orderBy('views_count', 'desc')
        .limit(limit);

      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/recent
  async getRecentArticles(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const articles = await BlogArticle.query()
        .where('status', 'published')
        .withGraphFetched('author')
        .orderBy('published_at', 'desc')
        .limit(limit);

      res.json({
        success: true,
        data: articles
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/category/:category
  async getArticlesByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const query = BlogArticle.query()
        .where('category', category)
        .where('status', 'published')
        .withGraphFetched('author')
        .orderBy('published_at', 'desc');

      const total = await query.resultSize();
      const articles = await query.page(page - 1, limit);

      res.json({
        success: true,
        data: articles.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/blog/stats
  async getBlogStats(req, res, next) {
    try {
      const total = await BlogArticle.query().count('* as count').first();
      const published = await BlogArticle.query().where('status', 'published').count('* as count').first();
      const draft = await BlogArticle.query().where('status', 'draft').count('* as count').first();

      // Categories breakdown
      const byCategory = await BlogArticle.query()
        .select('category')
        .count('* as count')
        .where('status', 'published')
        .groupBy('category')
        .orderBy('count', 'desc');

      // Monthly publication stats
      const currentYear = new Date().getFullYear();
      const monthlyPublications = await BlogArticle.query()
        .select(BlogArticle.raw('MONTH(published_at) as month'), BlogArticle.raw('COUNT(*) as count'))
        .where('status', 'published')
        .whereRaw('YEAR(published_at) = ?', [currentYear])
        .groupByRaw('MONTH(published_at)')
        .orderBy('month');

      // Most viewed articles
      const mostViewed = await BlogArticle.query()
        .where('status', 'published')
        .withGraphFetched('author')
        .orderBy('views_count', 'desc')
        .limit(5);

      // Top authors
      const topAuthors = await BlogArticle.query()
        .select('author_id')
        .count('* as articles_count')
        .sum('views_count as total_views')
        .join('users', 'blog_articles.author_id', 'users.id')
        .select('users.name as author_name')
        .where('blog_articles.status', 'published')
        .groupBy('author_id', 'users.name')
        .orderBy('articles_count', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          total: parseInt(total.count),
          published: parseInt(published.count),
          draft: parseInt(draft.count),
          byCategory,
          monthlyPublications,
          mostViewed,
          topAuthors
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper method to generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
}

module.exports = new BlogController();