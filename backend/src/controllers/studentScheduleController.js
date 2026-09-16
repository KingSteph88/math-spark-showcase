const service = require('../services/studentScheduleService');

async function availableSlots(request, reply) {
  return reply.send(await service.availableSlots(request.query));
}

async function myBookings(request, reply) {
  return reply.send(await service.myBookings(request.user.id, request.query));
}

async function requestSlot(request, reply) {
  const booking = await service.requestSlot(request.user.id, request.body.slotId, {
    studentNote: request.body.studentNote,
  });
  return reply.code(201).send(booking);
}

async function cancelBooking(request, reply) {
  return reply.send(await service.cancelBooking(request.user.id, request.params.id));
}

module.exports = { availableSlots, myBookings, requestSlot, cancelBooking };
