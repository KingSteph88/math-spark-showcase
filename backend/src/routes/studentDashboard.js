const controller = require('../controllers/studentDashboardController');
const authenticate  = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

async function studentDashboardRoutes(fastify) {
  fastify.get(
    '/',
    {
      preHandler: [
        authenticate,
        authorize('student'),
      ],
    },
    controller.dashboard
  );
}

module.exports = studentDashboardRoutes;