const courseService = require('../services/courseService');

async function create(request, reply) {
  const course = await courseService.createCourse(request.body, request.user.id);
  return reply.code(201).send(course);
}

async function list(request, reply) {
  const courses = await courseService.listCourses();
  return reply.send(courses);
}

async function getOne(request, reply) {
  const data = await courseService.getCourseWithChapters(request.params.id);
  return reply.send(data);
}

async function update(request, reply) {
  const course = await courseService.updateCourse(request.params.id, request.body);
  return reply.send(course);
}

async function remove(request, reply) {
  await courseService.deleteCourse(request.params.id);
  return reply.code(204).send();
}

async function createChapter(request, reply) {
  const chapter = await courseService.createChapter(request.body);
  return reply.code(201).send(chapter);
}

async function updateChapter(request, reply) {
  const chapter = await courseService.updateChapter(request.params.id, request.body);
  return reply.send(chapter);
}

async function removeChapter(request, reply) {
  await courseService.deleteChapter(request.params.id);
  return reply.code(204).send();
}

module.exports = { create, list, getOne, update, remove, createChapter, updateChapter, removeChapter };