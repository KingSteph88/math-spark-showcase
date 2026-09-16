/**
 * The student "Schedule" page is now private 1:1 appointment booking with
 * the teacher. Group live sessions moved to Exam Preparation — see
 * studentExamPrepService.upcomingLiveSessions.
 *
 * The actual mechanics live in bookingService; this module is the thin
 * student-facing view over it.
 */
const bookingService = require('./bookingService');

async function availableSlots(query = {}) {
  return bookingService.listOpenSlots(query);
}

async function myBookings(studentId, query = {}) {
  return bookingService.listStudentBookings(studentId, query);
}

async function requestSlot(studentId, slotId, { studentNote } = {}) {
  return bookingService.requestBooking(studentId, slotId, { studentNote });
}

async function cancelBooking(studentId, bookingId) {
  return bookingService.cancelBooking('student', studentId, bookingId);
}

module.exports = { availableSlots, myBookings, requestSlot, cancelBooking };
