const Fastify = require('fastify');
const cors = require('@fastify/cors');

const authRoutes = require('./routes/auth');
const teacherAuthRoutes = require('./routes/teacherAuth');
const dashboardRoutes = require('./routes/dashboard');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const announcementRoutes = require('./routes/announcements');
const liveSessionRoutes = require('./routes/liveSessions');
const lessonRoutes = require('./routes/lessons');
const teacherBookingRoutes = require('./routes/teacherBookings');

/**
 * Builds and returns the Fastify instance.
 */
function buildApp() {

  const app = Fastify({
    logger: true
  });

  // CORS configuration
  app.register(cors, {
    origin: [
      "http://localhost:8081",
      "http://localhost:5173"
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],
    credentials: true
  });

  // Multipart and static must be registered BEFORE any route that relies
  // on request.parts() or serves an uploaded file — plugins only apply to
  // routes registered after them.
  app.register(require('@fastify/multipart'), {
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB — videos are YouTube links now
  });

  app.register(require('@fastify/static'), {
    root: require('./utils/storage').UPLOAD_DIR,
    prefix: '/uploads/',
  });

  // Central error handler
  app.setErrorHandler((err, request, reply) => {

    if (err.validation) {
      return reply.code(400).send({
        error: 'Validation error',
        details: err.validation
      });
    }

    // Surface Mongoose validation problems as 400s rather than 500s
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return reply.code(400).send({ error: err.message });
    }

    const statusCode = err.statusCode || 500;

    if (statusCode === 500) {
      request.log.error(err);
    }

    reply.code(statusCode).send({
      error: err.message || 'Internal server error'
    });

  });

  // Health check
  app.get('/health', async () => ({
    status: 'ok'
  }));

  /* ---------------- Auth ---------------- */
  // /auth/login is the SINGLE login for teachers and students alike; the
  // response's accountType tells the client where to land.
  app.register(authRoutes, { prefix: '/auth' });

  // Legacy teacher-only auth endpoints, kept so existing clients/tokens
  // keep working. New clients should use /auth/login.
  app.register(teacherAuthRoutes, { prefix: '/teacher-auth' });

  /* ---------------- Teacher platform ---------------- */
  app.register(dashboardRoutes, { prefix: '/teacher/dashboard' });
  app.register(studentRoutes, { prefix: '/teacher/students' });
  app.register(courseRoutes, { prefix: '/teacher/courses' });
  app.register(announcementRoutes, { prefix: '/teacher/announcements' });
  app.register(require('./routes/resources'), { prefix: '/teacher/resources' });
  app.register(liveSessionRoutes, { prefix: '/teacher/live-sessions' });
  app.register(lessonRoutes, { prefix: '/teacher/lessons' });
  // Availability, slots, days off and incoming booking requests
  app.register(teacherBookingRoutes, { prefix: '/teacher/scheduling' });

  /* ---------------- Admin ---------------- */
  app.register(require('./routes/adminUsers'), { prefix: '/admin/users' });
  app.register(require('./routes/paymentPlans'), { prefix: '/plans' });

  /* ---------------- Student platform ---------------- */
  app.register(require('./routes/studentDashboard'), { prefix: '/student/dashboard' });
  app.register(require('./routes/studentCourses'), { prefix: '/student/courses' });
  app.register(require('./routes/studentResources'), { prefix: '/student/resources' });
  // Exam Preparation — includes the group live sessions
  app.register(require('./routes/studentExamPrep'), { prefix: '/student/exam-prep' });
  // Schedule — private 1:1 appointment booking with the teacher
  app.register(require('./routes/studentSchedule'), { prefix: '/student/schedule' });
  app.register(require('./routes/studentProfile'), { prefix: '/student/profile' });

  return app;
}

module.exports = buildApp();
