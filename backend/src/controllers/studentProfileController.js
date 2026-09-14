const service = require('../services/studentProfileService');

async function getProfile(request, reply) {
  const data = await service.getProfile(request.user.id);
  return reply.send(data);
}

async function updateProfile(request, reply) {
  const data = await service.updateProfile(request.user.id, request.body || {});
  return reply.send(data);
}

module.exports = { getProfile, updateProfile };