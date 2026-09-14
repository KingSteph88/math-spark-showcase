/**
 * Role-Based Access Control middleware.
 *
 * Usage:
 *
 * preHandler: [
 *   authenticate,
 *   authorize('admin')
 * ]
 *
 * or
 *
 * preHandler: [
 *   authenticate,
 *   authorize('teacher', 'admin')
 * ]
 */
function authorize(...allowedRoles) {
  return async function (request, reply) {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        error: 'You do not have permission to perform this action',
      });
    }
  };
}

module.exports = authorize;