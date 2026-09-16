const controller = require('../controllers/studentScheduleController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const studentOnly = [authenticate, authorize('student')];

const requestSchema = {
  body: {
    type: 'object',
    required: ['slotId'],
    properties: {
      slotId: { type: 'string' },
      studentNote: { type: 'string', maxLength: 1000 },
    },
  },
};

/**
 * Schedule = booking a private appointment with the teacher.
 */
async function studentScheduleRoutes(fastify) {
  // Open slots the student can claim
  fastify.get('/slots', { preHandler: studentOnly }, controller.availableSlots);

  // This student's own requests and confirmed sessions
  fastify.get('/bookings', { preHandler: studentOnly }, controller.myBookings);
  fastify.post(
    '/bookings',
    { schema: requestSchema, preHandler: studentOnly },
    controller.requestSlot
  );
  fastify.post('/bookings/:id/cancel', { preHandler: studentOnly }, controller.cancelBooking);
}

module.exports = studentScheduleRoutes;
