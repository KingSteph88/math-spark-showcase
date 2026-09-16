const fs = require('fs/promises');
const path = require('path');
const resourceService = require('../services/resourceService');
const { saveUploadedFile, UPLOAD_DIR } = require('../utils/storage');

/**
 * Expects multipart/form-data: the file part plus text fields
 * (title, category, courseId, chapterId, difficulty, examYear,
 * linkedResourceId, isPublished).
 *
 * IMPORTANT: a file part's stream must be consumed *before* the async
 * iterator advances to the next part — @fastify/multipart drains and
 * destroys any stream you leave behind. So we write the file to disk
 * inside the loop rather than holding the part and saving afterwards.
 */
async function create(request, reply) {
  const fields = {};
  let saved = null;

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (saved) {
        // Only one file per resource; drain any extras so the iterator
        // can move on cleanly instead of stalling.
        await part.toBuffer();
        continue;
      }
      saved = await saveUploadedFile(part);
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  if (!saved) {
    const err = new Error('A file is required');
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    title: fields.title,
    category: fields.category,
    fileUrl: saved.fileUrl,
    fileType: saved.fileType,
    fileSizeBytes: saved.fileSizeBytes,
  };

  // Optional fields: only set the ones actually sent, so we don't write
  // empty strings into ObjectId/enum paths and trip validation.
  if (fields.courseId) payload.courseId = fields.courseId;
  if (fields.chapterId) payload.chapterId = fields.chapterId;
  if (fields.difficulty) payload.difficulty = fields.difficulty;
  if (fields.examYear) payload.examYear = Number(fields.examYear);
  if (fields.linkedResourceId) payload.linkedResourceId = fields.linkedResourceId;
  if (fields.isPublished !== undefined) {
    payload.isPublished = fields.isPublished === 'true' || fields.isPublished === true;
  }

  try {
    const resource = await resourceService.create(payload, request.user.id);
    return reply.code(201).send(resource);
  } catch (err) {
    // Don't leave an orphaned file on disk if the document fails to save.
    await fs.unlink(path.join(UPLOAD_DIR, saved.storedName)).catch(() => {});
    if (err.name === 'ValidationError') err.statusCode = 400;
    throw err;
  }
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
