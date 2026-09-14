const controller = require('../controllers/studentExamPrepController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

async function studentExamPrepRoutes(fastify) {
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('student')] },
    controller.overview
  );
}

module.exports = studentExamPrepRoutes;