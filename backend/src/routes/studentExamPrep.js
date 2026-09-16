const controller = require('../controllers/studentExamPrepController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const studentOnly = [authenticate, authorize('student')];

async function studentExamPrepRoutes(fastify) {
  fastify.get('/', { preHandler: studentOnly }, controller.overview);

  // Group live sessions (free, one-to-many) — moved here from /schedule.
  fastify.get('/live-sessions', { preHandler: studentOnly }, controller.liveSessions);
}

module.exports = studentExamPrepRoutes;
