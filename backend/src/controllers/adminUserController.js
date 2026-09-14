const adminUserService = require('../services/adminUserService');

async function pendingUsers(request, reply) {

  const users =
    await adminUserService.getPendingUsers();

  return reply.send(users);

}

async function approve(request, reply) {

  const user =
    await adminUserService.approveUser(
      request.params.id,
      request.user.id
    );

  return reply.send({
    message: 'Student approved successfully.',
    user
  });

}

async function users(request, reply) {

  const users =
    await adminUserService.getAllUsers(
      request.query.status
    );

  return reply.send(users);

}

async function suspend(request, reply) {

  const user =
    await adminUserService.suspendUser(
      request.params.id,
      request.user.id
    );


  return reply.send({
    message: 'User suspended successfully.',
    user
  });

}

async function activate(request, reply) {

  const user =
    await adminUserService.activateUser(
      request.params.id,
      request.user.id
    );

  return reply.send({
    message: 'User activated successfully.',
    user,
  });
}

module.exports = {
  pendingUsers,
  users,
  approve,
  suspend, 
  activate
};