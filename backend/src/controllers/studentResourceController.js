const service = require('../services/studentResourceService');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listCategories(request, reply) {
  const data = await service.listCategorySummaries(request.user.id);
  return reply.send(data);
}

async function listByCategory(request, reply) {
  const { category } = request.params;

  if (!service.CATEGORIES.includes(category)) {
    throw httpError('Unknown resource category.', 400);
  }

  const data = await service.listByCategory(request.user.id, category, {
    courseId: request.query.courseId,
  });

  return reply.send(data);
}

async function download(request, reply) {
  const { fileUrl } = await service.registerDownload(
    request.user.id,
    request.params.resourceId
  );
  return reply.send({ fileUrl });
}

module.exports = {
  listCategories,
  listByCategory,
  download,
};
