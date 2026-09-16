const { Lesson, Chapter } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function create(data) {
  const chapter = await Chapter.findById(data.chapterId);
  if (!chapter) throw httpError('Chapter not found', 404);
  return Lesson.create({ ...data, courseId: chapter.courseId });
}

async function listByChapter(chapterId) {
  return Lesson.find({ chapterId }).sort({ order: 1 }).populate('downloadableResources.resourceId');
}

async function update(id, data) {
  const lesson = await Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!lesson) throw httpError('Lesson not found', 404);
  return lesson;
}

async function remove(id) {
  const lesson = await Lesson.findByIdAndDelete(id);
  if (!lesson) throw httpError('Lesson not found', 404);
}

module.exports = { create, listByChapter, update, remove };