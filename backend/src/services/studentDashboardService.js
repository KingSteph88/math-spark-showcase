const {
  User,
  Progress,
  Lesson,
  Course,
} = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function dashboard(userId) {

  const [
    user,
    progressRecords,
    totalPublishedLessons,
    lastProgress,
  ] = await Promise.all([

    User.findById(userId)
      .populate({
        path: 'subscription.planId',
        select: 'name price durationDays',
      }),

    Progress.find({ userId }),

    Lesson.countDocuments({
      isPublished: true,
    }),

    Progress.findOne({ userId })
      .sort({ lastAccessedAt: -1 })
      .populate({
        path: 'courseId',
        select: 'title',
      })
      .populate({
        path: 'chapterId',
        select: 'title',
      })
      .populate({
        path: 'lessonId',
        select: 'title',
      }),

  ]);

  if (!user) {
    throw httpError('Student not found.', 404);
  }

  // -----------------------------
  // Dashboard statistics
  // -----------------------------

  const completedLessons = progressRecords.filter(
    p => p.completed
  ).length;

  const overallProgress =
    totalPublishedLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalPublishedLessons) * 100
        );

  const activeChapters = new Set(
    progressRecords.map(p => p.chapterId.toString())
  ).size;

  const activeCourses = new Set(
    progressRecords.map(p => p.courseId.toString())
  ).size;

  // -----------------------------
  // Continue Learning
  // -----------------------------

  let continueLearning = null;

  if (lastProgress) {

    const [
      completedLessonsInCourse,
      totalLessonsInCourse,
    ] = await Promise.all([

      Progress.countDocuments({
        userId,
        courseId: lastProgress.courseId._id,
        completed: true,
      }),

      Lesson.countDocuments({
        courseId: lastProgress.courseId._id,
        isPublished: true,
      }),

    ]);

    const progress =
      totalLessonsInCourse === 0
        ? 0
        : Math.round(
            (completedLessonsInCourse /
              totalLessonsInCourse) *
              100
          );

    continueLearning = {

      courseId: lastProgress.courseId._id,
      courseTitle: lastProgress.courseId.title,

      chapterId: lastProgress.chapterId._id,
      chapterTitle: lastProgress.chapterId.title,

      lessonId: lastProgress.lessonId._id,
      lessonTitle: lastProgress.lessonId.title,

      progress,

      completed: lastProgress.completed,

      watchTimeSeconds:
        lastProgress.watchTimeSeconds,

      lastAccessedAt:
        lastProgress.lastAccessedAt,
    };
  }
  // -----------------------------
// Recent Courses
// -----------------------------

const courseIds = [
  ...new Set(
    progressRecords.map(p => p.courseId.toString())
  ),
];

const recentCourses = await Promise.all(

  courseIds.map(async (courseId) => {

    const [
      course,
      completedLessons,
      totalLessons,
      lastVisited,
    ] = await Promise.all([

      Course.findById(courseId)
        .select('title coverImage'),

      Progress.countDocuments({
        userId,
        courseId,
        completed: true,
      }),

      Lesson.countDocuments({
        courseId,
        isPublished: true,
      }),

      Progress.findOne({
        userId,
        courseId,
      }).sort({
        lastAccessedAt: -1,
      }),

    ]);

    if (!course) {
      return null;
    }

    const progress =
      totalLessons === 0
        ? 0
        : Math.round(
            (completedLessons / totalLessons) * 100
          );

    return {

      courseId: course._id,

      title: course.title,

      coverImage: course.coverImage,

      completedLessons,

      totalLessons,

      progress,

      lastAccessedAt:
        lastVisited?.lastAccessedAt ?? null,

    };

  })

);
    const filteredCourses = recentCourses
  .filter(Boolean)
  .sort(
    (a, b) =>
      new Date(b.lastAccessedAt) -
      new Date(a.lastAccessedAt)
  );

  // -----------------------------
  // Response
  // -----------------------------

  return {

  user: {

    id: user._id,

    firstName: user.firstName,

    lastName: user.lastName,

    email: user.email,

    profilePicture: user.profilePicture,

    subscription: user.subscription,

  },

  stats: {

    overallProgress,

    completedLessons,

    activeChapters,

    activeCourses,

  },

  continueLearning,

  recentCourses: filteredCourses,

};

}

module.exports = {
  dashboard,
};