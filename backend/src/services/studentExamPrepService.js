const { Resource } = require('../models');

/**
 * Exam prep is a curated view on top of the resource library rather than
 * its own collection: each "path" points at the resource category (or
 * categories) a student should work through.
 */
async function overview() {
  const counts = await Resource.aggregate([
    { $match: { isPublished: true } },
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

module.exports = { overview };