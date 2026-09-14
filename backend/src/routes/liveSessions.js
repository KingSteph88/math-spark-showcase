const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const liveSessionController = require('../controllers/liveSessionController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

const bodySchema = {
  body: {
    type: 'object',
    required: ['title', 'scheduledAt', 'meetingLink'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      courseId: { type: 'string' },
      scheduledAt: { type: 'string', format: 'date-time' },
      durationMinutes: { type: 'number' },
      platform: { type: 'string', enum: ['google_meet', 'zoom'] },
      meetingLink: { type: 'string' },
      targetAudience: { type: 'string', enum: ['all', 'specific'] },
      targetStudentIds: { type: 'array', items: { type: 'string' } },
    },
  },
};

async function liveSessionRoutes(app) {
  app.post('/', { schema: bodySchema, preHandler: teacherOnly }, liveSessionController.create);
  app.get('/', { preHandler: teacherOnly }, liveSessionController.list);
  app.patch('/:id', { preHandler: teacherOnly }, liveSessionController.update);
  app.delete('/:id', { preHandler: teacherOnly }, liveSessionController.remove);
}

module.exports = liveSessionRoutes;