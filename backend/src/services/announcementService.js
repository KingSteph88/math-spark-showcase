const { Announcement } = require('../models');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function create(data, teacherId) {
  return Announcement.create({ ...data, teacherId });
}

async function list() {
  return Announcement.find({}).sort({ isPinned: -1, publishedAt: -1 });
}

async function update(id, data) {
  const a = await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!a) throw httpError('Announcement not found', 404);
  return a;
}

async function remove(id) {
  const a = await Announcement.findByIdAndDelete(id);
  if (!a) throw httpError('Announcement not found', 404);
}

module.exports = { create, list, update, remove };