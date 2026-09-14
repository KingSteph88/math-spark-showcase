const service = require('../services/studentResourceService');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listCategories(request, reply) {
  const data = await service.listCategorySummaries();
  return reply.send(data);
}

async function listByCategory(request, reply) {
  const { category } = request.params;

  if (!service.CATEGORIES.includes(category)) {
    throw httpError('Unknown resource category.', 400);
  }

  const data = await service.listByCategory(category, {
    courseId: request.query.courseId,
  });

  return reply.send(data);
}

async function download(request, reply) {
  await service.registerDownload(request.params.resourceId);
  return reply.code(204).send();
}

module.exports = {
  listCategories,
  listByCategory,
  download,
};