const liveSessionService = require('../services/liveSessionService');

async function create(request, reply) {
  const s = await liveSessionService.create(request.body, request.user.id);
  return reply.code(201).send(s);
}

async function list(request, reply) {
  const data = await liveSessionService.list();
  return reply.send(data);
}

async function update(request, reply) {
  const s = await liveSessionService.update(request.params.id, request.body);
  return reply.send(s);
}

async function remove(request, reply) {
  await liveSessionService.remove(request.params.id);
  return reply.code(204).send();
}

module.exports = { create, list, update, remove };