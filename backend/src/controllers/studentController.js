const studentService = require('../services/studentService');

async function list(request, reply) {
  const data = await studentService.listStudents(request.query);
  return reply.send(data);
}

async function getOne(request, reply) {
  const student = await studentService.getStudentById(request.params.id);
  return reply.send(student);
}

module.exports = { list, getOne };