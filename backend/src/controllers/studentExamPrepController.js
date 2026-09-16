const service = require('../services/studentExamPrepService');

async function overview(request, reply) {
  const data = await service.overview(request.user.id);
  return reply.send(data);
}

// Live sessions live under Exam Preparation on the student platform.
async function liveSessions(request, reply) {
  const data = await service.upcomingLiveSessions(request.user.id);
  return reply.send(data);
}

module.exports = { overview, liveSessions };
