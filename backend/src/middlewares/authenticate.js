const { User, Teacher } = require('../models');
const { verifyAccessToken } = require('../utils/tokens');


async function authenticate(request, reply) {

  const header = request.headers.authorization;


  if (!header || !header.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Missing or invalid Authorization header',
    });
  }


  const token = header.slice('Bearer '.length);


  try {

    const payload = verifyAccessToken(token);


    let account;


    switch (payload.accountType) {

      case 'student':
        account = await User.findById(payload.sub);
        break;


      case 'teacher':
        account = await Teacher.findById(payload.sub);
        break;


      default:
        return reply.code(401).send({
          error: 'Invalid account type',
        });

    }


    if (!account) {
      return reply.code(401).send({
        error: 'User no longer exists',
      });
    }


    // Block suspended accounts
    if (account.status === 'suspended') {
      return reply.code(403).send({
        error: 'Account suspended',
      });
    }


    request.user = {
      id: account._id.toString(),
      role: payload.role,
      accountType: payload.accountType,
    };


  } catch (err) {

    request.log.error(err);

    return reply.code(401).send({
      error: 'Access token is invalid or has expired',
    });

  }

}


module.exports = authenticate;