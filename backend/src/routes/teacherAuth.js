const teacherAuthController = require('../controllers/teacherAuthController');

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};

const refreshTokenBodySchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: { refreshToken: { type: 'string' } },
  },
};

async function teacherAuthRoutes(app) {
  app.post('/login', { schema: loginSchema }, teacherAuthController.login);
  app.post('/refresh', { schema: refreshTokenBodySchema }, teacherAuthController.refresh);
  app.post('/logout', { schema: refreshTokenBodySchema }, teacherAuthController.logout);
}

module.exports = teacherAuthRoutes;