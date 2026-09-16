const bookingService = require('../services/bookingService');

/* ---------------- Teacher: availability ---------------- */

async function listTemplates(request, reply) {
  return reply.send(await bookingService.listTemplates(request.user.id));
}

async function createTemplate(request, reply) {
  const tpl = await bookingService.createTemplate(request.user.id, request.body);
  return reply.code(201).send(tpl);
}

async function updateTemplate(request, reply) {
  const tpl = await bookingService.updateTemplate(
    request.user.id,
    request.params.id,
    request.body
  );
  return reply.send(tpl);
}

async function deleteTemplate(request, reply) {
  await bookingService.deleteTemplate(request.user.id, request.params.id);
  return reply.code(204).send();
}

async function generateSlots(request, reply) {
  const result = await bookingService.generateSlots(request.user.id, {
    days: request.body?.days ? Number(request.body.days) : 30,
  });
  return reply.send(result);
}

async function listSlots(request, reply) {
  return reply.send(await bookingService.listSlots(request.user.id, request.query));
}

async function createSlot(request, reply) {
  const slot = await bookingService.createSlot(request.user.id, request.body);
  return reply.code(201).send(slot);
}

async function deleteSlot(request, reply) {
  await bookingService.deleteSlot(request.user.id, request.params.id);
  return reply.code(204).send();
}

async function listBlockedDates(request, reply) {
  return reply.send(await bookingService.listBlockedDates(request.user.id));
}

async function blockDate(request, reply) {
  const blocked = await bookingService.blockDate(request.user.id, request.body);
  return reply.code(201).send(blocked);
}

async function unblockDate(request, reply) {
  await bookingService.unblockDate(request.user.id, request.params.id);
  return reply.code(204).send();
}

/* ---------------- Teacher: bookings ---------------- */

async function listTeacherBookings(request, reply) {
  return reply.send(
    await bookingService.listTeacherBookings(request.user.id, request.query)
  );
}

async function acceptBooking(request, reply) {
  return reply.send(
    await bookingService.acceptBooking(request.user.id, request.params.id, request.body || {})
  );
}

async function declineBooking(request, reply) {
  return reply.send(
    await bookingService.declineBooking(request.user.id, request.params.id, request.body || {})
  );
}

async function completeBooking(request, reply) {
  return reply.send(await bookingService.completeBooking(request.user.id, request.params.id));
}

async function teacherCancelBooking(request, reply) {
  return reply.send(
    await bookingService.cancelBooking('teacher', request.user.id, request.params.id)
  );
}

/* ---------------- Student ---------------- */

async function listOpenSlots(request, reply) {
  return reply.send(await bookingService.listOpenSlots(request.query));
}

async function requestBooking(request, reply) {
  const booking = await bookingService.requestBooking(
    request.user.id,
    request.body.slotId,
    { studentNote: request.body.studentNote }
  );
  return reply.code(201).send(booking);
}

async function listStudentBookings(request, reply) {
  return reply.send(
    await bookingService.listStudentBookings(request.user.id, request.query)
  );
}

async function studentCancelBooking(request, reply) {
  return reply.send(
    await bookingService.cancelBooking('student', request.user.id, request.params.id)
  );
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
  listTeacherBookings,
  acceptBooking,
  declineBooking,
  completeBooking,
  teacherCancelBooking,
  listOpenSlots,
  requestBooking,
  listStudentBookings,
  studentCancelBooking,
};
