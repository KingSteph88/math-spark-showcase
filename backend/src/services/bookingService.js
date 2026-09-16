const {
  AvailabilityTemplate,
  AvailabilitySlot,
  BlockedDate,
  Booking,
  Teacher,
  User,
} = require('../models');
const { sendEmail } = require('../utils/email');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function startOfUtcDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function parseHhMm(value) {
  const [h, m] = String(value).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw httpError('Times must be in HH:MM format.', 400);
  }
  return { h, m };
}

/* ------------------------------------------------------------------ *
 * Teacher: recurring availability templates
 * ------------------------------------------------------------------ */

async function listTemplates(teacherId) {
  return AvailabilityTemplate.find({ teacherId }).sort({ dayOfWeek: 1, startTime: 1 }).lean();
}

async function createTemplate(teacherId, data) {
  const start = parseHhMm(data.startTime);
  const end = parseHhMm(data.endTime);

  if (end.h * 60 + end.m <= start.h * 60 + start.m) {
    throw httpError('End time must be after start time.', 400);
  }

  return AvailabilityTemplate.create({ ...data, teacherId });
}

async function updateTemplate(teacherId, templateId, data) {
  const tpl = await AvailabilityTemplate.findOneAndUpdate(
    { _id: templateId, teacherId },
    data,
    { new: true, runValidators: true }
  );
  if (!tpl) throw httpError('Availability template not found.', 404);
  return tpl;
}

async function deleteTemplate(teacherId, templateId) {
  const tpl = await AvailabilityTemplate.findOneAndDelete({ _id: templateId, teacherId });
  if (!tpl) throw httpError('Availability template not found.', 404);

  // Only drop slots nobody has claimed yet — removing a booked slot would
  // orphan a student's confirmed session.
  await AvailabilitySlot.deleteMany({
    sourceTemplateId: templateId,
    status: 'open',
    startTime: { $gte: new Date() },
  });
}

/* ------------------------------------------------------------------ *
 * Teacher: expanding templates into concrete bookable slots
 * ------------------------------------------------------------------ */

/**
 * Rolls the teacher's weekly patterns forward into real slots for the
 * next `days` days, skipping blocked dates, past times, and anything
 * already generated (the teacherId+startTime unique index is the guard).
 */
async function generateSlots(teacherId, { days = 30 } = {}) {
  const templates = await AvailabilityTemplate.find({ teacherId, isActive: true }).lean();
  if (!templates.length) return { created: 0 };

  const now = new Date();
  const from = startOfUtcDay(now);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + days);

  const blocked = await BlockedDate.find({
    teacherId,
    date: { $gte: from, $lte: to },
  }).lean();

  const blockedKeys = new Set(blocked.map((b) => startOfUtcDay(b.date).toISOString()));

  const candidates = [];

  for (let i = 0; i < days; i += 1) {
    const day = new Date(from);
    day.setUTCDate(day.getUTCDate() + i);

    if (blockedKeys.has(day.toISOString())) continue;

    for (const tpl of templates) {
      if (tpl.dayOfWeek !== day.getUTCDay()) continue;

      const start = parseHhMm(tpl.startTime);
      const end = parseHhMm(tpl.endTime);
      const duration = tpl.sessionDurationMinutes || 60;

      const windowStart = new Date(day);
      windowStart.setUTCHours(start.h, start.m, 0, 0);

      const windowEnd = new Date(day);
      windowEnd.setUTCHours(end.h, end.m, 0, 0);

      for (
        let cursor = new Date(windowStart);
        cursor.getTime() + duration * 60000 <= windowEnd.getTime();
        cursor = new Date(cursor.getTime() + duration * 60000)
      ) {
        if (cursor <= now) continue;

        candidates.push({
          teacherId,
          date: day,
          startTime: new Date(cursor),
          endTime: new Date(cursor.getTime() + duration * 60000),
          status: 'open',
          sourceTemplateId: tpl._id,
        });
      }
    }
  }

  if (!candidates.length) return { created: 0 };

  // ordered:false keeps going past duplicate-key errors, which are just
  // slots a previous run already created.
  try {
    const inserted = await AvailabilitySlot.insertMany(candidates, { ordered: false });
    return { created: inserted.length };
  } catch (err) {
    if (err.code === 11000 || err.writeErrors) {
      return { created: err.insertedDocs ? err.insertedDocs.length : 0 };
    }
    throw err;
  }
}

async function listSlots(teacherId, { from, to } = {}) {
  const filter = { teacherId };

  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  } else {
    filter.startTime = { $gte: new Date() };
  }

  return AvailabilitySlot.find(filter).sort({ startTime: 1 }).lean();
}

/** One-off slot outside the weekly pattern. */
async function createSlot(teacherId, { startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw httpError('startTime and endTime must be valid dates.', 400);
  }
  if (end <= start) throw httpError('End time must be after start time.', 400);

  try {
    return await AvailabilitySlot.create({
      teacherId,
      date: startOfUtcDay(start),
      startTime: start,
      endTime: end,
      status: 'open',
    });
  } catch (err) {
    if (err.code === 11000) throw httpError('That slot already exists.', 409);
    throw err;
  }
}

async function deleteSlot(teacherId, slotId) {
  const slot = await AvailabilitySlot.findOne({ _id: slotId, teacherId });
  if (!slot) throw httpError('Slot not found.', 404);

  if (['requested', 'booked'].includes(slot.status)) {
    throw httpError(
      'This slot has a live booking. Decline or cancel the booking first.',
      409
    );
  }

  await slot.deleteOne();
}

/* ------------------------------------------------------------------ *
 * Teacher: blocked days
 * ------------------------------------------------------------------ */

async function listBlockedDates(teacherId) {
  return BlockedDate.find({ teacherId }).sort({ date: 1 }).lean();
}

async function blockDate(teacherId, { date, reason }) {
  const day = startOfUtcDay(date);
  if (Number.isNaN(day.getTime())) throw httpError('Invalid date.', 400);

  const blockedDate = await BlockedDate.findOneAndUpdate(
    { teacherId, date: day },
    { $set: { reason } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const nextDay = new Date(day);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // Pull unclaimed slots off the calendar; leave live bookings alone so
  // the teacher has to cancel them deliberately.
  await AvailabilitySlot.deleteMany({
    teacherId,
    status: 'open',
    startTime: { $gte: day, $lt: nextDay },
  });

  return blockedDate;
}

async function unblockDate(teacherId, blockedDateId) {
  const removed = await BlockedDate.findOneAndDelete({ _id: blockedDateId, teacherId });
  if (!removed) throw httpError('Blocked date not found.', 404);
}

/* ------------------------------------------------------------------ *
 * Bookings
 * ------------------------------------------------------------------ */

function serializeBooking(booking, { slot, student, teacher } = {}) {
  return {
    id: booking._id,
    status: booking.status,
    studentNote: booking.studentNote,
    teacherNote: booking.teacherNote,
    meetingLink: booking.meetingLink,
    requestedAt: booking.requestedAt,
    respondedAt: booking.respondedAt,
    slot: slot
      ? { id: slot._id, startTime: slot.startTime, endTime: slot.endTime, status: slot.status }
      : null,
    student: student
      ? {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        }
      : null,
    teacher: teacher
      ? { id: teacher._id, firstName: teacher.firstName, lastName: teacher.lastName }
      : null,
  };
}

/** Open, future slots a student can click. */
async function listOpenSlots({ teacherId, from, to } = {}) {
  const filter = {
    status: 'open',
    startTime: { $gte: from ? new Date(from) : new Date() },
  };

  if (teacherId) filter.teacherId = teacherId;
  if (to) filter.startTime.$lte = new Date(to);

  const slots = await AvailabilitySlot.find(filter)
    .sort({ startTime: 1 })
    .populate({ path: 'teacherId', select: 'firstName lastName' })
    .lean();

  return slots.map((s) => ({
    id: s._id,
    startTime: s.startTime,
    endTime: s.endTime,
    teacher: s.teacherId
      ? { id: s.teacherId._id, firstName: s.teacherId.firstName, lastName: s.teacherId.lastName }
      : null,
  }));
}

/**
 * Student claims a slot. The status flip is done with a conditional
 * update so two students clicking the same slot at the same time can't
 * both win it.
 */
async function requestBooking(studentId, slotId, { studentNote } = {}) {
  const slot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, status: 'open', startTime: { $gt: new Date() } },
    { $set: { status: 'requested' } },
    { new: true }
  );

  if (!slot) {
    throw httpError('That slot is no longer available.', 409);
  }

  try {
    const booking = await Booking.create({
      studentId,
      teacherId: slot.teacherId,
      slotId: slot._id,
      status: 'pending',
      studentNote,
      requestedAt: new Date(),
    });

    notifyTeacherOfRequest(slot, booking).catch(() => {});

    return serializeBooking(booking, { slot });
  } catch (err) {
    // Roll the slot back so a failed write doesn't strand it.
    await AvailabilitySlot.updateOne({ _id: slot._id }, { $set: { status: 'open' } });
    if (err.code === 11000) throw httpError('That slot is no longer available.', 409);
    throw err;
  }
}

async function listStudentBookings(studentId, { status } = {}) {
  const filter = { studentId };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'slotId' })
    .populate({ path: 'teacherId', select: 'firstName lastName' })
    .lean();

  return bookings.map((b) =>
    serializeBooking(b, { slot: b.slotId, teacher: b.teacherId })
  );
}

async function listTeacherBookings(teacherId, { status } = {}) {
  const filter = { teacherId };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: 'slotId' })
    .populate({ path: 'studentId', select: 'firstName lastName email' })
    .lean();

  return bookings.map((b) =>
    serializeBooking(b, { slot: b.slotId, student: b.studentId })
  );
}

/** Teacher accepts: slot becomes booked and the student gets the link. */
async function acceptBooking(teacherId, bookingId, { meetingLink, teacherNote } = {}) {
  const booking = await Booking.findOne({ _id: bookingId, teacherId, status: 'pending' });
  if (!booking) throw httpError('Pending booking not found.', 404);

  booking.status = 'accepted';
  booking.respondedAt = new Date();
  if (meetingLink) booking.meetingLink = meetingLink;
  if (teacherNote) booking.teacherNote = teacherNote;
  await booking.save();

  await AvailabilitySlot.updateOne({ _id: booking.slotId }, { $set: { status: 'booked' } });

  const [slot, student] = await Promise.all([
    AvailabilitySlot.findById(booking.slotId).lean(),
    User.findById(booking.studentId).lean(),
  ]);

  notifyStudentOfDecision(student, slot, booking, 'accepted').catch(() => {});

  return serializeBooking(booking, { slot, student });
}

/** Teacher declines: the slot reopens for someone else. */
async function declineBooking(teacherId, bookingId, { teacherNote } = {}) {
  const booking = await Booking.findOne({ _id: bookingId, teacherId, status: 'pending' });
  if (!booking) throw httpError('Pending booking not found.', 404);

  booking.status = 'declined';
  booking.respondedAt = new Date();
  if (teacherNote) booking.teacherNote = teacherNote;
  await booking.save();

  await AvailabilitySlot.updateOne({ _id: booking.slotId }, { $set: { status: 'open' } });

  const [slot, student] = await Promise.all([
    AvailabilitySlot.findById(booking.slotId).lean(),
    User.findById(booking.studentId).lean(),
  ]);

  notifyStudentOfDecision(student, slot, booking, 'declined').catch(() => {});

  return serializeBooking(booking, { slot, student });
}

/**
 * Either side calls this off. `actor` is 'student' or 'teacher' and
 * scopes which booking the caller is allowed to touch.
 */
async function cancelBooking(actor, actorId, bookingId) {
  const filter = { _id: bookingId, status: { $in: ['pending', 'accepted'] } };
  filter[actor === 'teacher' ? 'teacherId' : 'studentId'] = actorId;

  const booking = await Booking.findOne(filter);
  if (!booking) throw httpError('Booking not found.', 404);

  booking.status = 'cancelled';
  booking.respondedAt = new Date();
  await booking.save();

  await AvailabilitySlot.updateOne({ _id: booking.slotId }, { $set: { status: 'open' } });

  return serializeBooking(booking);
}

async function completeBooking(teacherId, bookingId) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, teacherId, status: 'accepted' },
    { $set: { status: 'completed' } },
    { new: true }
  );
  if (!booking) throw httpError('Accepted booking not found.', 404);
  return serializeBooking(booking);
}

/* ------------------------------------------------------------------ *
 * Notifications (best-effort — a mail failure must not fail the action)
 * ------------------------------------------------------------------ */

function formatSlot(slot) {
  if (!slot) return '';
  return new Date(slot.startTime).toUTCString();
}

async function notifyTeacherOfRequest(slot, booking) {
  const [teacher, student] = await Promise.all([
    Teacher.findById(slot.teacherId).lean(),
    User.findById(booking.studentId).lean(),
  ]);

  if (!teacher?.email) return;

  await sendEmail({
    to: teacher.email,
    subject: 'New private session request — Mathéa',
    html: `
      <h2>New session request</h2>
      <p>${student?.firstName || 'A student'} ${student?.lastName || ''} requested a private session.</p>
      <p><strong>When:</strong> ${formatSlot(slot)}</p>
      ${booking.studentNote ? `<p><strong>Note:</strong> ${booking.studentNote}</p>` : ''}
      <p>Open your Teacher Studio to accept or decline.</p>
    `,
  });
}

async function notifyStudentOfDecision(student, slot, booking, decision) {
  if (!student?.email) return;

  const accepted = decision === 'accepted';

  await sendEmail({
    to: student.email,
    subject: accepted
      ? 'Your private session is confirmed — Mathéa'
      : 'Your session request was declined — Mathéa',
    html: accepted
      ? `
        <h2>Session confirmed</h2>
        <p><strong>When:</strong> ${formatSlot(slot)}</p>
        ${booking.meetingLink ? `<p><a href="${booking.meetingLink}">Join the session</a></p>` : ''}
        ${booking.teacherNote ? `<p><strong>Note from your teacher:</strong> ${booking.teacherNote}</p>` : ''}
      `
      : `
        <h2>Session request declined</h2>
        <p>Your request for ${formatSlot(slot)} could not be accepted.</p>
        ${booking.teacherNote ? `<p><strong>Note:</strong> ${booking.teacherNote}</p>` : ''}
        <p>The slot is open again, and you can pick another time from your schedule.</p>
      `,
  });
}

module.exports = {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateSlots,
  listSlots,
  createSlot,
  deleteSlot,
  listBlockedDates,
  blockDate,
  unblockDate,
  listOpenSlots,
  requestBooking,
  listStudentBookings,
  listTeacherBookings,
  acceptBooking,
  declineBooking,
  cancelBooking,
  completeBooking,
};
