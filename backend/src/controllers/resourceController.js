const resourceService = require('../services/resourceService');
const { saveUploadedFile } = require('../utils/storage');

/**
 * Expects multipart/form-data: the file part plus text fields
 * (title, category, courseId, chapterId, difficulty, examYear, linkedResourceId).
 */
async function create(request, reply) {
  const parts = request.parts();
  let filePart = null;
  const fields = {};

  for await (const part of parts) {
    if (part.type === 'file') {
      filePart = part;
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  if (!filePart) {
    const err = new Error('A file is required');
    err.statusCode = 400;
    throw err;
  }

  const { fileUrl, fileType, fileSizeBytes } = await saveUploadedFile(filePart);

  const resource = await resourceService.create(
    { ...fields, fileUrl, fileType, fileSizeBytes },
    request.user.id
  );
  return reply.code(201).send(resource);
}

async function list(request, reply) {
  const data = await resourceService.list(request.query);
  return reply.send(data);
}

async function remove(request, reply) {
  await resourceService.remove(request.params.id);
  return reply.code(204).send();
}

module.exports = { create, list, remove };