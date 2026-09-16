const lessonService = require('../services/lessonService');
const { requireYouTubeUrl } = require('../utils/youtube');

/**
 * Lessons are plain JSON now — the video is a pasted YouTube link, so
 * there is no multipart/file handling left on this route.
 */

function parseResourceIds(value) {
  if (!value) return [];
  const ids = Array.isArray(value) ? value : JSON.parse(value);
  return ids.map((resourceId) => ({ resourceId }));
}

async function create(request, reply) {
  const body = request.body || {};

  const { videoId, videoUrl } = requireYouTubeUrl(body.videoUrl);

  const lesson = await lessonService.create({
    chapterId: body.chapterId,
    title: body.title,
    description: body.description,
    order: body.order != null ? Number(body.order) : 0,
    // Default to visible: a teacher who adds a lesson expects students to
    // see it unless they explicitly keep it as a draft.
    isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    videoUrl,
    youtubeVideoId: videoId,
    videoDurationSeconds: body.videoDurationSeconds,
    downloadableResources: parseResourceIds(body.resourceIds),
  });

  return reply.code(201).send(lesson);
}

async function listByChapter(request, reply) {
  const lessons = await lessonService.listByChapter(request.query.chapterId);
  return reply.send(lessons);
}

async function update(request, reply) {
  const body = request.body || {};
  const data = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.order !== undefined) data.order = Number(body.order);
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
  if (body.videoDurationSeconds !== undefined) {
    data.videoDurationSeconds = Number(body.videoDurationSeconds);
  }
  if (body.resourceIds !== undefined) {
    data.downloadableResources = parseResourceIds(body.resourceIds);
  }

  // An empty/absent videoUrl on edit means "keep the current video".
  if (body.videoUrl) {
    const { videoId, videoUrl } = requireYouTubeUrl(body.videoUrl);
    data.videoUrl = videoUrl;
    data.youtubeVideoId = videoId;
  }

  const lesson = await lessonService.update(request.params.id, data);
  return reply.send(lesson);
}

async function remove(request, reply) {
  await lessonService.remove(request.params.id);
  return reply.code(204).send();
}

module.exports = { create, listByChapter, update, remove };
