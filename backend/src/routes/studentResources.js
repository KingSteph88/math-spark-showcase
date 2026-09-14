const controller = require('../controllers/studentResourceController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

async function studentResourceRoutes(fastify) {
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('student')] },
    controller.listCategories
  );

  fastify.get(
    '/:category',
    { preHandler: [authenticate, authorize('student')] },
    controller.listByCategory
  );

  fastify.post(
    '/:resourceId/download',
    { preHandler: [authenticate, authorize('student')] },
    controller.download
  );
}

module.exports = studentResourceRoutes;