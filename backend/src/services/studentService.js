const { User } = require('../models');

const PLAN_POPULATE = { path: 'subscription.planId', select: 'name price durationDays' };

async function listStudents({ search, status, page = 1, limit = 20 }) {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [students, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .populate(PLAN_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return { students, total, page: Number(page), limit: Number(limit) };
}

async function getStudentById(id) {
  const student = await User.findById(id).select('-passwordHash').populate(PLAN_POPULATE);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  return student;
}

module.exports = { listStudents, getStudentById };
