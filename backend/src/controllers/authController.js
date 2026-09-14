const authService = require('../services/authService');

function requestMeta(request) {
  return {
    userAgent: request.headers['user-agent'],
    ipAddress: request.ip,
  };
}

async function register(request, reply) {
  const user = await authService.register(request.body);
  return reply.code(201).send({
    message:
      'Account created. Check your email to verify your address, then complete payment to activate your account.',
    user,
  });
}

async function verifyEmail(request, reply) {
  const user = await authService.verifyEmail(request.body.token);
  return reply.send({ message: 'Email verified successfully', user });
}

async function verifyEmailLink(request, reply) {
  const { token } = request.query;

  if (!token) {
    return reply.code(400).send({
      message: 'Verification token is required.',
    });
  }

  await authService.verifyEmail(token);

  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Verified</title>
        <style>
          body{
            font-family: Arial, sans-serif;
            background:#f5f5f5;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
          }

          .card{
            background:white;
            padding:40px;
            border-radius:10px;
            box-shadow:0 2px 10px rgba(0,0,0,.15);
            text-align:center;
            max-width:500px;
          }

          h2{
            color:#16a34a;
          }

          p{
            margin-top:20px;
          }
        </style>
      </head>

      <body>

        <div class="card">

          <h2>✅ Email verified successfully</h2>

          <p>
            Your account has been verified.
          </p>

          <p>
            Your account is now waiting for administrator approval.
          </p>

          <p>
            You will receive another email once your account has been approved.
          </p>

        </div>

      </body>

    </html>
  `);
}

async function login(request, reply) {
  const result = await authService.login(request.body, requestMeta(request));
  return reply.send(result);
}

async function refresh(request, reply) {
  const result = await authService.refreshAccessToken(request.body.refreshToken, requestMeta(request));
  return reply.send(result);
}

async function logout(request, reply) {
  await authService.logout(request.body.refreshToken);
  return reply.code(204).send();
}

async function forgotPassword(request, reply) {
  await authService.forgotPassword(request.body.email);
  return reply.send({ message: 'If an account exists for that email, a reset link has been sent.' });
}

async function resetPassword(request, reply) {
  await authService.resetPassword(request.body.token, request.body.newPassword);
  return reply.send({ message: 'Password reset successfully. Please log in again.' });
}

module.exports = {
  register,
  verifyEmail,
  verifyEmailLink,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};