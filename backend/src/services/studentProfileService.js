const { User, Progress, Course } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getProfile(userId) {
  const user = await User.findById(userId).populate({
    path: 'subscription.planId',
    select: 'name price durationDays type',
  });

  if (!user) {
    throw httpError('Student not found.', 404);
  }

  const progressRecords = await Progress.find({ userId });

  const completedLessons = progressRecords.filter((p) => p.completed).length;

  const courseIds = [...new Set(progressRecords.map((p) => p.courseId.toString()))];

  const courses = await Course.find({ _id: { $in: courseIds } }).select('title');

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePicture: user.profilePicture,
    status: user.status,
    subscription: user.subscription,
    joinedAt: user.createdAt,
    stats: {
      completedLessons,
      enrolledCourses: courses.map((c) => ({ id: c._id, title: c.title })),
    },
  };
}

async function updateProfile(userId, { firstName, lastName, phone }) {
  const update = {};
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;
  if (phone !== undefined) update.phone = phone;

  const user = await User.findByIdAndUpdate(userId, update, { new: true });

  if (!user) {
    throw httpError('Student not found.', 404);
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePicture: user.profilePicture,
  };
}

module.exports = { getProfile, updateProfile };