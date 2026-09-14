const controller = require('../controllers/paymentPlanController');

const createPlanSchema = {
  body: {
    type: 'object',
    required: [
      'name',
      'type',
      'price',
      'durationDays'
    ],
    properties: {
      name: { type: 'string' },
      type: {
        type: 'string',
        enum: ['one_time', 'monthly', 'semester']
      },
      price: { type: 'number' },
      currency: { type: 'string' },
      durationDays: { type: 'number' },
      description: { type: 'string' }
    }
  }
};

async function paymentPlanRoutes(app) {

  app.post(
    '/',
    {
      schema: createPlanSchema
    },
    controller.createPlan
  );

  app.get(
    '/',
    controller.getPlans
  );

}

module.exports = paymentPlanRoutes;