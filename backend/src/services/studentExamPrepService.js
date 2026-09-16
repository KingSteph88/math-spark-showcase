const { Resource, LiveSession } = require('../models');
const {
  getSubjectAccess,
  resourceFilterForAccess,
  allowedCourseIds,
} = require('./subjectAccessService');

/**
 * Exam prep is a curated view over the resource library plus the free
 * one-to-many live sessions the teacher runs. Everything here is scoped
 * to what the student's payment plan covers.
 */
async function overview(userId) {
  const subjectAccess = await getSubjectAccess(userId);
  const scope = await resourceFilterForAccess(subjectAccess);

  const counts = await Resource.aggregate([
    { $match: { isPublished: true, ...scope } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countByCategory = new Map(counts.map((c) => [c._id, c.count]));

  const exerciseSeries = countByCategory.get('exercise_series') || 0;
  const previousExams = countByCategory.get('previous_exam') || 0;
  const corrections = countByCategory.get('correction') || 0;

  return [
    {
      key: 'midterm_review',
      title: 'Midterm Review',
      description:
        'Consolidate the first half of the semester with focused exercises and key formulas.',
      resourceCategory: 'exercise_series',
      count: exerciseSeries,
    },
    {
      key: 'mock_exams',
      title: 'Mock Exams',
      description:
        'Simulate exam conditions with timed past papers and instant corrections.',
      resourceCategory: 'previous_exam',
      count: previousExams,
    },
    {
      key: 'final_prep',
      title: 'Final Exam Preparation',
      description:
        'Master every chapter with a curated roadmap combining exercises, past exams and corrections.',
      resourceCategory: 'correction',
      count: exerciseSeries + previousExams + corrections,
    },
  ];
}

/**
 * Upcoming group live sessions visible to this student: open to everyone
 * or targeted at them specifically, and — when tied to a course — only
 * if their plan covers that course's subject.
 */
async function upcomingLiveSessions(userId) {
  const subjectAccess = await getSubjectAccess(userId);
  const courseIds = await allowedCourseIds(subjectAccess);

  if (subjectAccess === 'none') return [];

  const sessions = await LiveSession.find({
    status: { $in: ['scheduled', 'ongoing'] },
    // include sessions that started less than an hour ago so a student
    // who is running late can still join
    scheduledAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    $and: [
      { $or: [{ targetAudience: 'all' }, { targetStudentIds: userId }] },
      {
        $or: [
          { courseId: { $in: courseIds } },
          { courseId: { $exists: false } },
          { courseId: null },
        ],
      },
    ],
  })
    .sort({ scheduledAt: 1 })
    .populate({ path: 'teacherId', select: 'firstName lastName' })
    .populate({ path: 'courseId', select: 'title subject' })
    .lean();

  return sessions.map((s) => ({
    id: s._id,
    title: s.title,
    description: s.description,
    scheduledAt: s.scheduledAt,
    durationMinutes: s.durationMinutes,
    platform: s.platform,
    meetingLink: s.meetingLink,
    status: s.status,
    teacher: s.teacherId
      ? { firstName: s.teacherId.firstName, lastName: s.teacherId.lastName }
      : null,
    course: s.courseId
      ? { id: s.courseId._id, title: s.courseId.title, subject: s.courseId.subject }
      : null,
  }));
}

module.exports = { overview, upcomingLiveSessions };
