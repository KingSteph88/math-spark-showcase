const { User, Course } = require('../models');

const ALL_SUBJECTS = ['analysis', 'algebra'];

/**
 * Resolves which course subject(s) a student may see, from the
 * PaymentPlan attached to their subscription.
 *
 * A student on the analysis-only plan sees analysis courses, chapters,
 * lessons and resources; algebra-only sees algebra; the full pack sees
 * both.
 *
 * If the plan is missing or inactive we return 'none' rather than
 * silently granting everything — failing open here would hand the whole
 * library to an unpaid account.
 */
async function getSubjectAccess(userId) {
  const user = await User.findById(userId)
    .populate({ path: 'subscription.planId', select: 'subjectAccess' })
    .lean();

  if (!user) return 'none';

  const access = user?.subscription?.planId?.subjectAccess;

  return access || 'none';
}

/**
 * Expands an access level into the concrete list of subjects it covers.
 */
function subjectsFor(subjectAccess) {
  if (subjectAccess === 'both') return [...ALL_SUBJECTS];
  if (ALL_SUBJECTS.includes(subjectAccess)) return [subjectAccess];
  return [];
}

/**
 * Mongo filter fragment scoping a Course query to what the access level
 * allows. 'none' yields a filter that matches nothing.
 */
function courseFilterForAccess(subjectAccess) {
  const subjects = subjectsFor(subjectAccess);
  if (!subjects.length) return { _id: { $in: [] } };
  if (subjects.length === ALL_SUBJECTS.length) return {};
  return { subject: { $in: subjects } };
}

function canAccessSubject(subjectAccess, subject) {
  return subjectsFor(subjectAccess).includes(subject);
}

/**
 * Ids of every published course the student's plan covers. Resources and
 * exam-prep counts are scoped through this, since Resource carries a
 * courseId rather than a subject of its own.
 */
async function allowedCourseIds(subjectAccess) {
  const subjects = subjectsFor(subjectAccess);
  if (!subjects.length) return [];

  const courses = await Course.find({
    isPublished: true,
    subject: { $in: subjects },
  })
    .select('_id')
    .lean();

  return courses.map((c) => c._id);
}

/**
 * Mongo filter fragment scoping a Resource query.
 *
 * Resources with no courseId are treated as library-wide (a general
 * formula sheet, say) and stay visible to any paying student; anything
 * pinned to a course is gated by that course's subject.
 */
async function resourceFilterForAccess(subjectAccess) {
  const subjects = subjectsFor(subjectAccess);
  if (!subjects.length) return { _id: { $in: [] } };

  if (subjects.length === ALL_SUBJECTS.length) return {};

  const courseIds = await allowedCourseIds(subjectAccess);

  return {
    $or: [
      { courseId: { $in: courseIds } },
      { courseId: { $exists: false } },
      { courseId: null },
    ],
  };
}

module.exports = {
  ALL_SUBJECTS,
  getSubjectAccess,
  subjectsFor,
  courseFilterForAccess,
  canAccessSubject,
  allowedCourseIds,
  resourceFilterForAccess,
};
