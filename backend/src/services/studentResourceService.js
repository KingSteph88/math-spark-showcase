const { Resource } = require('../models');
const {
  getSubjectAccess,
  resourceFilterForAccess,
} = require('./subjectAccessService');

const CATEGORIES = [
  'formula_sheet',
  'course_summary',
  'exercise_series',
  'previous_exam',
  'correction',
];

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * One card per category with a live count of published resources the
 * student's plan actually covers — an analysis-only student should not
 * see "12 resources" and then land on an empty algebra list.
 */
async function listCategorySummaries(userId) {
  const subjectAccess = await getSubjectAccess(userId);
  const scope = await resourceFilterForAccess(subjectAccess);

  const counts = await Resource.aggregate([
    { $match: { isPublished: true, ...scope } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countByCategory = new Map(counts.map((c) => [c._id, c.count]));

  return CATEGORIES.map((category) => ({
    category,
    count: countByCategory.get(category) || 0,
  }));
}

/**
 * Published resources within a single category, scoped to the student's
 * plan and optionally to one course.
 */
async function listByCategory(userId, category, { courseId } = {}) {
  const subjectAccess = await getSubjectAccess(userId);
  const scope = await resourceFilterForAccess(subjectAccess);

  const filter = { category, isPublished: true, ...scope };
  if (courseId) filter.courseId = courseId;

  const resources = await Resource.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'courseId', select: 'title subject' })
    .lean();

  return resources.map((r) => ({
    id: r._id,
    title: r.title,
    category: r.category,
    course: r.courseId
      ? { id: r.courseId._id, title: r.courseId.title, subject: r.courseId.subject }
      : null,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    fileSizeBytes: r.fileSizeBytes,
    difficulty: r.difficulty,
    examYear: r.examYear,
    downloadsCount: r.downloadsCount,
  }));
}

/**
 * Re-checks access before counting a download — the download endpoint is
 * otherwise an unguarded way to reach a gated file's id.
 */
async function registerDownload(userId, resourceId) {
  const subjectAccess = await getSubjectAccess(userId);
  const scope = await resourceFilterForAccess(subjectAccess);

  const resource = await Resource.findOne({
    _id: resourceId,
    isPublished: true,
    ...scope,
  }).lean();

  if (!resource) {
    throw httpError('Your current plan does not include access to this resource.', 403);
  }

  await Resource.updateOne({ _id: resourceId }, { $inc: { downloadsCount: 1 } });

  return { fileUrl: resource.fileUrl };
}

module.exports = {
  CATEGORIES,
  listCategorySummaries,
  listByCategory,
  registerDownload,
};
