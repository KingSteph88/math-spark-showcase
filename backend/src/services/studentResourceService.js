const { Resource } = require('../models');

const CATEGORIES = [
  'formula_sheet',
  'course_summary',
  'exercise_series',
  'previous_exam',
  'correction',
];

/**
 * One card per category with a live count of published resources —
 * powers the Resources library landing page.
 */
async function listCategorySummaries() {
  const counts = await Resource.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countByCategory = new Map(counts.map((c) => [c._id, c.count]));

  return CATEGORIES.map((category) => ({
    category,
    count: countByCategory.get(category) || 0,
  }));
}

/**
 * Published resources within a single category, optionally scoped to a
 * course. Used for the "browse files" view.
 */
async function listByCategory(category, { courseId } = {}) {
  const filter = { category, isPublished: true };
  if (courseId) filter.courseId = courseId;

  const resources = await Resource.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'courseId', select: 'title' })
    .lean();

  return resources.map((r) => ({
    id: r._id,
    title: r.title,
    category: r.category,
    course: r.courseId ? { id: r.courseId._id, title: r.courseId.title } : null,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    fileSizeBytes: r.fileSizeBytes,
    difficulty: r.difficulty,
    examYear: r.examYear,
    downloadsCount: r.downloadsCount,
  }));
}

async function registerDownload(resourceId) {
  await Resource.updateOne({ _id: resourceId }, { $inc: { downloadsCount: 1 } });
}

module.exports = {
  CATEGORIES,
  listCategorySummaries,
  listByCategory,
  registerDownload,
};