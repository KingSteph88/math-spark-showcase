const controller = require('../controllers/adminUserController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

async function adminUserRoutes(app) {
  app.get('/',
  {
    preHandler: [
      authenticate,
      authorize('admin'),
    ],
  },
  controller.users
);

  app.get(
    '/pending',
    {
      preHandler: [
        authenticate,
        authorize('admin'),
      ],
    },
    controller.pendingUsers
  );

  app.patch(
    '/:id/approve',
    {
      preHandler: [
        authenticate,
        authorize('admin'),
      ],
    },
    controller.approve
  );
  app.patch(
  '/:id/suspend',
  {
    preHandler:[
      authenticate,
      authorize('admin')
    ]
  },
  controller.suspend
);
  app.patch(
  '/:id/activate',
  {
    preHandler: [
      authenticate,
      authorize('admin'),
    ],
  },
  controller.activate
);
}

module.exports = adminUserRoutes;