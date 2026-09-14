const { Resource } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function create(data, teacherId) {
  return Resource.create({ ...data, uploadedBy: teacherId });
}

async function list({ category, courseId }) {
  const filter = {};
  if (category) filter.category = category;
  if (courseId) filter.courseId = courseId;
  return Resource.find(filter).sort({ createdAt: -1 });
}

async function remove(id) {
  const r = await Resource.findByIdAndDelete(id);
  if (!r) throw httpError('Resource not found', 404);
}

module.exports = { create, list, remove };