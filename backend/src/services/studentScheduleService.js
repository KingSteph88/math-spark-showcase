const { LiveSession } = require('../models');

/**
 * Upcoming live sessions visible to a given student: either open to
 * everyone, or specifically targeted at them.
 */
async function upcomingSessions(userId) {
  const sessions = await LiveSession.find({
    status: { $in: ['scheduled', 'ongoing'] },
    scheduledAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // include sessions started <1h ago
    $or: [{ targetAudience: 'all' }, { targetStudentIds: userId }],
  })
    .sort({ scheduledAt: 1 })
    .populate({ path: 'teacherId', select: 'firstName lastName' })
    .populate({ path: 'courseId', select: 'title' })
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
    course: s.courseId ? { id: s.courseId._id, title: s.courseId.title } : null,
  }));
}

module.exports = { upcomingSessions };