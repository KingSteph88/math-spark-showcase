const authenticate = require('../middlewares/authenticate');
const requireRole = require('../middlewares/requireRole');
const resourceController = require('../controllers/resourceController');

const teacherOnly = [authenticate, requireRole('teacher', 'admin')];

async function resourceRoutes(app) {
  app.post('/', { preHandler: teacherOnly }, resourceController.create);
  app.get('/', { preHandler: teacherOnly }, resourceController.list);
  app.delete('/:id', { preHandler: teacherOnly }, resourceController.remove);
}

module.exports = resourceRoutes;