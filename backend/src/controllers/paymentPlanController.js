const { PaymentPlan } = require('../models');

async function createPlan(request, reply) {
  const plan = await PaymentPlan.create(request.body);

  return reply.code(201).send({
    message: 'Payment plan created successfully',
    plan
  });
}

async function getPlans(request, reply) {
  const plans = await PaymentPlan.find({
    isActive: true
  });

  return reply.send(plans);
}

module.exports = {
  createPlan,
  getPlans
};