const dashboardService = require('../services/dashboardService');

async function stats(request, reply) {
  const data = await dashboardService.getStats();
  return reply.send(data);
}

async function activity(request, reply) {
  const data = await dashboardService.getRecentActivity();
  return reply.send(data);
}

async function upcomingLive(request, reply) {
  const data = await dashboardService.getUpcomingLive();
  return reply.send(data);
}

module.exports = { stats, activity, upcomingLive };