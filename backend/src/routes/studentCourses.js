const controller = require('../controllers/studentCourseController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const progressBodySchema = {
  body: {
    type: 'object',
    properties: {
      completed: { type: 'boolean' },
      watchTimeSeconds: { type: 'number' },
    },
  },
};

async function studentCourseRoutes(fastify) {
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('student')] },
    controller.listCourses
  );

  fastify.get(
    '/:courseId/chapters/:chapterId',
    { preHandler: [authenticate, authorize('student')] },
    controller.getChapter
  );

  fastify.post(
    '/lessons/:lessonId/progress',
    {
      schema: progressBodySchema,
      preHandler: [authenticate, authorize('student')],
    },
    controller.updateLessonProgress
  );
}

module.exports = studentCourseRoutes;