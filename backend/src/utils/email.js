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

module.exports = {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  approvalEmail
};