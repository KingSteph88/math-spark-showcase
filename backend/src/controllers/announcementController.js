const announcementService = require('../services/announcementService');

async function create(request, reply) {
  const a = await announcementService.create(request.body, request.user.id);
  return reply.code(201).send(a);
}

async function list(request, reply) {
  const data = await announcementService.list();
  return reply.send(data);
}

async function update(request, reply) {
  const a = await announcementService.update(request.params.id, request.body);
  return reply.send(a);
}

async function remove(request, reply) {
  await announcementService.remove(request.params.id);
  return reply.code(204).send();
}

module.exports = { create, list, update, remove };