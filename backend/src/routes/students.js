const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const studentController = require('../controllers/studentController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

async function studentRoutes(app) {
  app.get('/', { preHandler: teacherOnly }, studentController.list);
  app.get('/:id', { preHandler: teacherOnly }, studentController.getOne);
  app.patch('/:id/approve', { preHandler: teacherOnly }, studentController.approve);
  app.patch('/:id/suspend', { preHandler: teacherOnly }, studentController.suspend);
  app.patch('/:id/activate', { preHandler: teacherOnly }, studentController.activate);
}

module.exports = studentRoutes;
