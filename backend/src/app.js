const Fastify = require('fastify');
const cors = require('@fastify/cors');
const authRoutes = require('../src/routes/auth');
const teacherAuthRoutes = require('../src/routes/teacherAuth');
const dashboardRoutes = require('../src/routes/dashboard');
const studentRoutes = require('../src/routes/students');
const courseRoutes = require('../src/routes/courses');
const announcementRoutes = require('../src/routes/announcements');
// const resourceRoutes = require('../src/routes/resources');
const liveSessionRoutes = require('../src/routes/liveSessions');
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
    credentials: true
  });



  // Central error handler
  app.setErrorHandler((err, request, reply) => {

    if (err.validation) {
      return reply.code(400).send({
        error: 'Validation error',
        details: err.validation
      });
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


  // Routes
  app.register(authRoutes, {
    prefix: '/auth'
  });
  app.register(teacherAuthRoutes, { prefix: '/teacher-auth' });
  app.register(dashboardRoutes, { prefix: '/teacher/dashboard' });
  app.register(studentRoutes, { prefix: '/teacher/students' });
  app.register(courseRoutes, { prefix: '/teacher/courses' });
  app.register(announcementRoutes, { prefix: '/teacher/announcements' });
  app.register(
    require('./routes/paymentPlans'),
    {
      prefix: '/plans'
    }
  );
  app.register(require('@fastify/multipart'));
  app.register(require('@fastify/static'), {
    root: require('./utils/storage').UPLOAD_DIR,
    prefix: '/uploads/',
  });
  app.register(require('./routes/resources'), { prefix: '/teacher/resources' });
  app.register(liveSessionRoutes, { prefix: '/teacher/live-sessions' });

  app.register(
    require('./routes/adminUsers'),
    {
      prefix: '/admin/users'
    }
  );


  app.register(
    require('./routes/teacherAuth'),
    {
      prefix: '/teacher/auth'
    }
  );

  app.register(
  require('./routes/studentDashboard'),
  {
    prefix: '/student/dashboard',
  }
);
   app.register(
    require('./routes/studentCourses'),
    {
      prefix: '/student/courses',
    }
  );
  app.register(
    require('./routes/studentResources'),
    {
      prefix: '/student/resources',
    }
  );

  app.register(
    require('./routes/studentExamPrep'),
    {
      prefix: '/student/exam-prep',
    }
  );

  app.register(
    require('./routes/studentSchedule'),
    {
      prefix: '/student/schedule',
    }
  );

  app.register(
    require('./routes/studentProfile'),
    {
      prefix: '/student/profile',
    }
  );


  return app;
}

module.exports = buildApp();