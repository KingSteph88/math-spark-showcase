const controller = require('../controllers/studentScheduleController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

async function studentScheduleRoutes(fastify) {
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('student')] },
    controller.upcoming
  );
}

module.exports = studentScheduleRoutes;