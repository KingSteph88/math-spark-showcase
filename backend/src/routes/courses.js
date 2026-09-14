const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const courseController = require('../controllers/courseController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

const courseBodySchema = {
  body: {
    type: 'object',
    required: ['title', 'slug'],
    properties: {
      title: { type: 'string', minLength: 1 },
      slug: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      coverImage: { type: 'string' },
      order: { type: 'number' },
      isPublished: { type: 'boolean' },
    },
  },
};

const chapterBodySchema = {
  body: {
    type: 'object',
    required: ['courseId', 'title'],
    properties: {
      courseId: { type: 'string' },
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      learningObjectives: { type: 'array', items: { type: 'string' } },
      order: { type: 'number' },
      isPublished: { type: 'boolean' },
    },
  },
};

async function courseRoutes(app) {
  app.post('/', { schema: courseBodySchema, preHandler: teacherOnly }, courseController.create);
  app.get('/', { preHandler: teacherOnly }, courseController.list);
  app.get('/:id', { preHandler: teacherOnly }, courseController.getOne);
  app.patch('/:id', { preHandler: teacherOnly }, courseController.update);
  app.delete('/:id', { preHandler: teacherOnly }, courseController.remove);

  app.post('/chapters', { schema: chapterBodySchema, preHandler: teacherOnly }, courseController.createChapter);
  app.patch('/chapters/:id', { preHandler: teacherOnly }, courseController.updateChapter);
  app.delete('/chapters/:id', { preHandler: teacherOnly }, courseController.removeChapter);
}

module.exports = courseRoutes;