const studentCourseService = require('../services/studentCourseService');

async function listCourses(request, reply) {
  const data = await studentCourseService.listCourses(request.user.id);
  return reply.send(data);
}

async function getChapter(request, reply) {
  const { courseId, chapterId } = request.params;
  const data = await studentCourseService.getChapterDetail(
    request.user.id,
    courseId,
    chapterId
  );
  return reply.send(data);
}

async function updateLessonProgress(request, reply) {
  const { lessonId } = request.params;
  const data = await studentCourseService.updateLessonProgress(
    request.user.id,
    lessonId,
    request.body || {}
  );
  return reply.send(data);
}

module.exports = {
  listCourses,
  getChapter,
  updateLessonProgress,
};