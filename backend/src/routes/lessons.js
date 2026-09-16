const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const lessonController = require('../controllers/lessonController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

const createSchema = {
  body: {
    type: 'object',
    required: ['chapterId', 'title', 'videoUrl'],
    properties: {
      chapterId: { type: 'string' },
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      videoUrl: { type: 'string', minLength: 1 },
      videoDurationSeconds: { type: 'number' },
      order: { type: 'number' },
      isPublished: { type: 'boolean' },
      resourceIds: { type: 'array', items: { type: 'string' } },
    },
  },
};

const updateSchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      videoUrl: { type: 'string' },
      videoDurationSeconds: { type: 'number' },
      order: { type: 'number' },
      isPublished: { type: 'boolean' },
      resourceIds: { type: 'array', items: { type: 'string' } },
    },
  },
};

async function lessonRoutes(app) {
  app.post('/', { schema: createSchema, preHandler: teacherOnly }, lessonController.create);
  app.get('/', { preHandler: teacherOnly }, lessonController.listByChapter);
  app.patch('/:id', { schema: updateSchema, preHandler: teacherOnly }, lessonController.update);
  app.delete('/:id', { preHandler: teacherOnly }, lessonController.remove);
}

module.exports = lessonRoutes;
