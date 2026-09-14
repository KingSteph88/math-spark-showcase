const service = require('../services/studentExamPrepService');

async function overview(request, reply) {
  const data = await service.overview();
  return reply.send(data);
}

module.exports = { overview };