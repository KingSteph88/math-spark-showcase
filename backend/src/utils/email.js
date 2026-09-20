const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  console.log(`Email sent to ${to}`);
}

function verificationEmail(rawToken) {
  const link =
`${process.env.APP_URL}/auth/verify-email?token=${rawToken}`;

  return {
    subject: 'Confirm your email — Mathéa',
    html: `
      <h2>Welcome to Mathéa!</h2>

      <p>Click below to verify your email.</p>

      <a href="${link}">
        Verify Email
      </a>

      <p>This link expires in 24 hours.</p>
    `,
  };
}

function approvalEmail(firstName) {

  return {

    subject: 'Your Mathéa account has been approved!',

    html: `
      <h2>Hello ${firstName},</h2>

      <p>

        Great news!

      </p>

      <p>

        Your account has been approved.

      </p>

      <p>

        You can now log in and start using Mathéa.

      </p>

      <p>

        Happy learning!

      </p>
    `
  };

}

function passwordResetEmail(rawToken) {

  const link =
    `${process.env.APP_URL}/reset-password?token=${rawToken}`;

  return {

    subject: 'Reset your password — Mathéa',

    html: `
      <h2>Password Reset</h2>

      <p>Click below to reset your password.</p>

      <a href="${link}">
        Reset Password
      </a>

      <p>This link expires in 15 minutes.</p>
    `
  };
}

function subscriptionExpiredEmail(firstName) {
  const link = `${process.env.APP_URL}/login`;

  return {
    subject: 'Your Mathéa subscription has ended',
    html: `
      <h2>Hello ${firstName},</h2>

      <p>
        Your subscription has reached its end date, so your account has
        been paused. Your progress and data are safe and waiting for you.
      </p>

      <p>
        Get in touch with your teacher to renew your plan. Once they
        reactivate your account from their end, you'll be able to log
        back in right away.
      </p>

      <a href="${link}">
        Go to login
      </a>

      <p>If you have any questions, just reply to this email.</p>
    `,
  };
}

module.exports = {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  approvalEmail,
  subscriptionExpiredEmail,
};