/**
 * Use after `authenticate`. authenticate() already sets request.user = { id, role }
 * from the JWT payload, so this just checks role membership.
 * Usage: { preHandler: [authenticate, requireRole('teacher', 'admin')] }
 */
function requireRole(...allowedRoles) {
  return async function (request, reply) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }
  };
}

module.exports = requireRole;