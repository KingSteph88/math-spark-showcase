const {
  Course,
  Chapter,
  Lesson,
  Resource,
  Progress,
} = require('../models');
const {
  getSubjectAccess,
  courseFilterForAccess,
  canAccessSubject,
} = require('./subjectAccessService');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * List all published courses with their published chapters, plus this
 * student's progress (completed lessons / total lessons) per chapter.
 * Only courses whose subject is covered by the student's payment plan
 * are returned.
 */
async function listCourses(userId) {
  const subjectAccess = await getSubjectAccess(userId);

  const courses = await Course.find({
    isPublished: true,
    ...courseFilterForAccess(subjectAccess),
  })
    .sort({ order: 1 })
    .lean();

  const courseIds = courses.map((c) => c._id);

  const chapters = await Chapter.find({
    courseId: { $in: courseIds },
    isPublished: true,
  })
    .sort({ order: 1 })
    .lean();

  const chapterIds = chapters.map((c) => c._id);

  const [lessons, progressRecords] = await Promise.all([
    Lesson.find({
      chapterId: { $in: chapterIds },
      isPublished: true,
    }).lean(),

    Progress.find({ userId, chapterId: { $in: chapterIds } }).lean(),
  ]);

  const lessonsByChapter = new Map();
  for (const lesson of lessons) {
    const key = lesson.chapterId.toString();
    if (!lessonsByChapter.has(key)) lessonsByChapter.set(key, []);
    lessonsByChapter.get(key).push(lesson);
  }

  const completedLessonIds = new Set(
    progressRecords.filter((p) => p.completed).map((p) => p.lessonId.toString())
  );

  const chaptersByCourse = new Map();
  for (const chapter of chapters) {
    const key = chapter.courseId.toString();
    if (!chaptersByCourse.has(key)) chaptersByCourse.set(key, []);

    const chapterLessons = lessonsByChapter.get(chapter._id.toString()) || [];
    const completedCount = chapterLessons.filter((l) =>
      completedLessonIds.has(l._id.toString())
    ).length;

    chaptersByCourse.get(key).push({
      id: chapter._id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      totalLessons: chapterLessons.length,
      completedLessons: completedCount,
      progress:
        chapterLessons.length === 0
          ? 0
          : Math.round((completedCount / chapterLessons.length) * 100),
    });
  }

  return courses.map((course) => ({
    id: course._id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    coverImage: course.coverImage,
    chapters: chaptersByCourse.get(course._id.toString()) || [],
  }));
}

/**
 * A single chapter, with its lessons, per-lesson completion state, and any
 * resources (summary / exercise series / correction) attached to it.
 */
async function getChapterDetail(userId, courseId, chapterId) {
  const subjectAccess = await getSubjectAccess(userId);

  const chapter = await Chapter.findOne({
    _id: chapterId,
    courseId,
    isPublished: true,
  })
    .populate({ path: 'courseId', select: 'title slug subject' })
    .lean();

  if (!chapter) {
    throw httpError('Chapter not found.', 404);
  }

  if (!canAccessSubject(subjectAccess, chapter.courseId.subject)) {
    throw httpError(
      'Your current plan does not include access to this course.',
      403
    );
  }

  const [lessons, resources, progressRecords] = await Promise.all([
    Lesson.find({ chapterId, isPublished: true }).sort({ order: 1 }).lean(),

    Resource.find({
      chapterId,
      isPublished: true,
      category: { $in: ['course_summary', 'exercise_series', 'correction'] },
    }).lean(),

    Progress.find({ userId, chapterId }).lean(),
  ]);

  const progressByLesson = new Map(
    progressRecords.map((p) => [p.lessonId.toString(), p])
  );

  return {
    id: chapter._id,
    title: chapter.title,
    description: chapter.description,
    learningObjectives: chapter.learningObjectives,
    course: {
      id: chapter.courseId._id,
      title: chapter.courseId.title,
      slug: chapter.courseId.slug,
    },
    lessons: lessons.map((lesson) => {
      const p = progressByLesson.get(lesson._id.toString());
      return {
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        youtubeVideoId: lesson.youtubeVideoId || null,
        videoDurationSeconds: lesson.videoDurationSeconds,
        completed: p?.completed || false,
        watchTimeSeconds: p?.watchTimeSeconds || 0,
      };
    }),
    resources: resources.map((r) => ({
      id: r._id,
      title: r.title,
      category: r.category,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
    })),
  };
}

/**
 * Upsert a Progress document for (student, lesson) — used to mark a lesson
 * as watched/completed and track resume position.
 */
async function updateLessonProgress(userId, lessonId, { completed, watchTimeSeconds }) {
  const lesson = await Lesson.findById(lessonId).populate({
    path: 'courseId',
    select: 'subject',
  });

  if (!lesson) {
    throw httpError('Lesson not found.', 404);
  }

  const subjectAccess = await getSubjectAccess(userId);

  if (!canAccessSubject(subjectAccess, lesson.courseId.subject)) {
    throw httpError(
      'Your current plan does not include access to this course.',
      403
    );
  }

  const update = {
    lastAccessedAt: new Date(),
  };

  if (typeof watchTimeSeconds === 'number') {
    update.watchTimeSeconds = watchTimeSeconds;
  }

  if (typeof completed === 'boolean') {
    update.completed = completed;
    if (completed) update.completedAt = new Date();
  }

  const progress = await Progress.findOneAndUpdate(
    { userId, lessonId },
    {
      $set: update,
      $setOnInsert: {
        userId,
        lessonId,
        chapterId: lesson.chapterId,
        courseId: lesson.courseId._id,
      },
    },
    { upsert: true, new: true }
  );

  return progress;
}

module.exports = {
  listCourses,
  getChapterDetail,
  updateLessonProgress,
};