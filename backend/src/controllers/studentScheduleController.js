const service = require('../services/studentScheduleService');

async function upcoming(request, reply) {
  const data = await service.upcomingSessions(request.user.id);
  return reply.send(data);
}

module.exports = { upcoming };