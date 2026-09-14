const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const dashboardController = require('../controllers/dashboardController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

async function dashboardRoutes(app) {
  app.get('/stats', { preHandler: teacherOnly }, dashboardController.stats);
  app.get('/activity', { preHandler: teacherOnly }, dashboardController.activity);
  app.get('/upcoming-live', { preHandler: teacherOnly }, dashboardController.upcomingLive);
}

module.exports = dashboardRoutes;