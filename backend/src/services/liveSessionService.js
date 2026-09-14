const { LiveSession } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function create(data, teacherId) {
  return LiveSession.create({ ...data, teacherId });
}

async function list() {
  return LiveSession.find({}).sort({ scheduledAt: 1 });
}

async function update(id, data) {
  const s = await LiveSession.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!s) throw httpError('Live session not found', 404);
  return s;
}

async function remove(id) {
  const s = await LiveSession.findByIdAndDelete(id);
  if (!s) throw httpError('Live session not found', 404);
}

module.exports = { create, list, update, remove };