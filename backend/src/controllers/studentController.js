const studentService = require('../services/studentService');
const adminUserService = require('../services/adminUserService');

async function list(request, reply) {
  const data = await studentService.listStudents(request.query);
  return reply.send(data);
}

async function getOne(request, reply) {
  const student = await studentService.getStudentById(request.params.id);
  return reply.send(student);
}

async function approve(request, reply) {
  const user = await adminUserService.approveUser(request.params.id, request.user.id);
  return reply.send({ message: 'Student approved successfully.', user });
}

async function suspend(request, reply) {
  const user = await adminUserService.suspendUser(request.params.id, request.user.id);
  return reply.send({ message: 'Student suspended successfully.', user });
}

async function activate(request, reply) {
  const user = await adminUserService.activateUser(request.params.id, request.user.id);
  return reply.send({ message: 'Student activated successfully.', user });
}

module.exports = { list, getOne, approve, suspend, activate };
