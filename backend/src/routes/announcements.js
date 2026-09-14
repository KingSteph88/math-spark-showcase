const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const announcementController = require('../controllers/announcementController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

const bodySchema = {
  body: {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: { type: 'string', minLength: 1 },
      content: { type: 'string', minLength: 1 },
      isPinned: { type: 'boolean' },
      isPublished: { type: 'boolean' },
      scheduledAt: { type: 'string', format: 'date-time' },
      targetAudience: { type: 'string', enum: ['all', 'specific'] },
      targetStudentIds: { type: 'array', items: { type: 'string' } },
    },
  },
};

async function announcementRoutes(app) {
  app.post('/', { schema: bodySchema, preHandler: teacherOnly }, announcementController.create);
  app.get('/', { preHandler: teacherOnly }, announcementController.list);
  app.patch('/:id', { preHandler: teacherOnly }, announcementController.update);
  app.delete('/:id', { preHandler: teacherOnly }, announcementController.remove);
}

module.exports = announcementRoutes;