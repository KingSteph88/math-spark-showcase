const { User, Chapter, Resource, LiveSession, Progress } = require('../models');

async function getStats() {
  const now = new Date();

  const [totalStudents, totalChapters, totalResources, upcomingLiveSessions] = await Promise.all([
    User.countDocuments({}),
    Chapter.countDocuments({}),
    Resource.countDocuments({}),
    LiveSession.countDocuments({ status: 'scheduled', scheduledAt: { $gte: now } }),
  ]);

  return { totalStudents, totalChapters, totalResources, upcomingLiveSessions };
}

async function getRecentActivity(limit = 10) {
  const recentCompletions = await Progress.find({ completed: true })
    .sort({ completedAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName')
    .populate('lessonId', 'title');

  return recentCompletions.map((p) => ({
    type: 'lesson_completed',
    studentName: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
    detail: p.lessonId ? p.lessonId.title : 'a lesson',
    at: p.completedAt,
  }));
}

async function getUpcomingLive(limit = 5) {
  return LiveSession.find({ status: 'scheduled', scheduledAt: { $gte: new Date() } })
    .sort({ scheduledAt: 1 })
    .limit(limit);
}

module.exports = { getStats, getRecentActivity, getUpcomingLive };