const teacherAuthService = require('../services/teacherAuthService');

function requestMeta(request) {
  return { userAgent: request.headers['user-agent'], ipAddress: request.ip };
}

async function login(request, reply) {
  const result = await teacherAuthService.login(request.body, requestMeta(request));
  return reply.send(result);
}

async function refresh(request, reply) {
  const result = await teacherAuthService.refreshAccessToken(request.body.refreshToken, requestMeta(request));
  return reply.send(result);
}

async function logout(request, reply) {
  await teacherAuthService.logout(request.body.refreshToken);
  return reply.code(204).send();
}

module.exports = { login, refresh, logout };