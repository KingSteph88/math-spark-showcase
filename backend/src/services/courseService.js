const { Course, Chapter } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function createCourse(data, teacherId) {
  return Course.create({ ...data, createdBy: teacherId });
}

async function listCourses() {
  return Course.find({}).sort({ order: 1 });
}

async function getCourseWithChapters(courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw httpError('Course not found', 404);
  const chapters = await Chapter.find({ courseId }).sort({ order: 1 });
  return { course, chapters };
}

async function updateCourse(courseId, data) {
  const course = await Course.findByIdAndUpdate(courseId, data, { new: true, runValidators: true });
  if (!course) throw httpError('Course not found', 404);
  return course;
}

async function deleteCourse(courseId) {
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) throw httpError('Course not found', 404);
  await Chapter.deleteMany({ courseId });
}

// Chapters

async function createChapter(data) {
  const course = await Course.findById(data.courseId);
  if (!course) throw httpError('Course not found', 404);
  return Chapter.create(data);
}

async function updateChapter(chapterId, data) {
  const chapter = await Chapter.findByIdAndUpdate(chapterId, data, { new: true, runValidators: true });
  if (!chapter) throw httpError('Chapter not found', 404);
  return chapter;
}

async function deleteChapter(chapterId) {
  const chapter = await Chapter.findByIdAndDelete(chapterId);
  if (!chapter) throw httpError('Chapter not found', 404);
}

module.exports = {
  createCourse,
  listCourses,
  getCourseWithChapters,
  updateCourse,
  deleteCourse,
  createChapter,
  updateChapter,
  deleteChapter,
};