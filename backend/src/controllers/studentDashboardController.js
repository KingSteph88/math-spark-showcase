const studentDashboardService = require('../services/studentDashboardService');

async function dashboard(request, reply) {
  const data = await studentDashboardService.dashboard(
    request.user.id
  );

  return reply.send(data);
}

module.exports = {
  dashboard,
};