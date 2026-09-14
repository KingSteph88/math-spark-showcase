const controller = require('../controllers/studentProfileController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const updateSchema = {
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string', minLength: 1 },
      lastName: { type: 'string', minLength: 1 },
      phone: { type: 'string' },
    },
  },
};

async function studentProfileRoutes(fastify) {
  fastify.get(
    '/',
    { preHandler: [authenticate, authorize('student')] },
    controller.getProfile
  );

  fastify.put(
    '/',
    { schema: updateSchema, preHandler: [authenticate, authorize('student')] },
    controller.updateProfile
  );
}

module.exports = studentProfileRoutes;