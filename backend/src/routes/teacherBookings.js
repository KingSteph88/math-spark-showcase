const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/bookingController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

const templateSchema = {
  body: {
    type: 'object',
    required: ['dayOfWeek', 'startTime', 'endTime'],
    properties: {
      dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
      startTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
      endTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
      sessionDurationMinutes: { type: 'integer', minimum: 15, maximum: 240 },
      isActive: { type: 'boolean' },
    },
  },
};

const slotSchema = {
  body: {
    type: 'object',
    required: ['startTime', 'endTime'],
    properties: {
      startTime: { type: 'string' },
      endTime: { type: 'string' },
    },
  },
};

const blockedDateSchema = {
  body: {
    type: 'object',
    required: ['date'],
    properties: {
      date: { type: 'string' },
      reason: { type: 'string' },
    },
  },
};

const respondSchema = {
  body: {
    type: 'object',
    properties: {
      meetingLink: { type: 'string' },
      teacherNote: { type: 'string' },
    },
  },
};

async function teacherBookingRoutes(app) {
  // Recurring weekly availability
  app.get('/templates', { preHandler: teacherOnly }, controller.listTemplates);
  app.post('/templates', { schema: templateSchema, preHandler: teacherOnly }, controller.createTemplate);
  app.patch('/templates/:id', { preHandler: teacherOnly }, controller.updateTemplate);
  app.delete('/templates/:id', { preHandler: teacherOnly }, controller.deleteTemplate);

  // Concrete slots
  app.post('/slots/generate', { preHandler: teacherOnly }, controller.generateSlots);
  app.get('/slots', { preHandler: teacherOnly }, controller.listSlots);
  app.post('/slots', { schema: slotSchema, preHandler: teacherOnly }, controller.createSlot);
  app.delete('/slots/:id', { preHandler: teacherOnly }, controller.deleteSlot);

  // Days off
  app.get('/blocked-dates', { preHandler: teacherOnly }, controller.listBlockedDates);
  app.post('/blocked-dates', { schema: blockedDateSchema, preHandler: teacherOnly }, controller.blockDate);
  app.delete('/blocked-dates/:id', { preHandler: teacherOnly }, controller.unblockDate);

  // Requests from students
  app.get('/bookings', { preHandler: teacherOnly }, controller.listTeacherBookings);
  app.post('/bookings/:id/accept', { schema: respondSchema, preHandler: teacherOnly }, controller.acceptBooking);
  app.post('/bookings/:id/decline', { schema: respondSchema, preHandler: teacherOnly }, controller.declineBooking);
  app.post('/bookings/:id/complete', { preHandler: teacherOnly }, controller.completeBooking);
  app.post('/bookings/:id/cancel', { preHandler: teacherOnly }, controller.teacherCancelBooking);
}

module.exports = teacherBookingRoutes;
