const authController = require('../controllers/authController');

const registerSchema = {
  body: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password', 'planId'],
    properties: {
      firstName: { type: 'string', minLength: 1 },
      lastName: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      planId: { type: 'string' },
    },
  },
};

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

const tokenBodySchema = {
  body: {
    type: 'object',
    required: ['token'],
    properties: { token: { type: 'string' } },
  },
};

const refreshTokenBodySchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: { refreshToken: { type: 'string' } },
  },
};

const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: { email: { type: 'string', format: 'email' } },
  },
};

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'newPassword'],
    properties: {
      token: { type: 'string' },
      newPassword: { type: 'string', minLength: 8 },
    },
  },
};

async function authRoutes(app) {
  app.post('/register', { schema: registerSchema }, authController.register);
  app.get('/verify-email',authController.verifyEmailLink);
  app.post('/verify-email', { schema: tokenBodySchema }, authController.verifyEmail);
  app.post('/login', { schema: loginSchema }, authController.login);
  app.post('/refresh', { schema: refreshTokenBodySchema }, authController.refresh);
  app.post('/logout', { schema: refreshTokenBodySchema }, authController.logout);
  app.post('/forgot-password', { schema: forgotPasswordSchema }, authController.forgotPassword);
  app.post('/reset-password', { schema: resetPasswordSchema }, authController.resetPassword);
}

module.exports = authRoutes;
