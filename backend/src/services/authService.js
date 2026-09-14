const { User, PaymentPlan } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, generateRawToken, hashToken } = require('../utils/tokens');
const { sendEmail, verificationEmail, passwordResetEmail } = require('../utils/email');
const {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('./tokenService');

const EMAIL_VERIFICATION_HOURS = 24;
const PASSWORD_RESET_MINUTES = 15;

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toPublicUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

/**
 * Student picks a plan and registers in one step. Account starts in
 * 'pending_payment' — it only becomes usable once payment completes and
 * an admin confirms it (that part is the Payments feature, built next).
 */
async function register({ firstName, lastName, email, password, planId }) {
  const plan = await PaymentPlan.findOne({ _id: planId, isActive: true });
  if (!plan) throw httpError('Selected plan is not available', 400);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError('An account with this email already exists', 409);

  const passwordHash = await hashPassword(password);
  const rawToken = generateRawToken();

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    status: 'pending_email_verification',
    subscription: { planId: plan._id, status: 'inactive' },
    emailVerificationToken: hashToken(rawToken),
    emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_HOURS * 60 * 60 * 1000),
  });

  const { subject, html } = verificationEmail(rawToken);
  await sendEmail({ to: user.email, subject, html });

  return toPublicUser(user);
}

async function verifyEmail(rawToken) {
  const user = await User.findOne({
    emailVerificationToken: hashToken(rawToken),
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw httpError('Verification link is invalid or has expired', 400);

  user.emailVerified = true;
  user.status = 'pending_approval';

  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return toPublicUser(user);
}

const STATUS_MESSAGES = {
  pending_email_verification:
    'Please verify your email before logging in.',

  pending_approval:
    'Your account is awaiting administrator approval.',

  suspended:
    'This account has been suspended.',

  expired:
    'Your subscription has expired.',
};

async function login({ email, password }, meta = {}) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('Invalid email or password', 401);

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) throw httpError('Invalid email or password', 401);

  if (!user.emailVerified) throw httpError('Please verify your email before logging in', 403);

  if (user.status !== 'active') {
    throw httpError(STATUS_MESSAGES[user.status] || 'Account is not active', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: 'student',
    accountType: 'student',
});
  const refreshToken = await issueRefreshToken(
    {
      userId: user._id,
      userType: 'User',
    },
    meta
  );

  return { accessToken, refreshToken, user: toPublicUser(user) };
}

async function refreshAccessToken(rawToken, meta = {}) {
  const rotated =
  await rotateRefreshToken(rawToken, meta);

  if (!rotated) {
    throw httpError(
      'Refresh token is invalid or has expired',
      401
    );
  }

  const accessToken = signAccessToken({
    sub: rotated.stored.userId.toString(),
    role: 'student',
    accountType: 'student',
});

  return {
    accessToken,
    refreshToken: rotated.refreshToken,
  };
}

async function logout(rawToken) {
  await revokeRefreshToken(rawToken);
}

async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always behave the same whether or not the account exists, so the
  // response can't be used to enumerate registered emails.
  if (user) {
    const rawToken = generateRawToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000);
    await user.save();

    const { subject, html } = passwordResetEmail(rawToken);
    await sendEmail({ to: user.email, subject, html });
  }
}

async function resetPassword(rawToken, newPassword) {
  const user = await User.findOne({
    passwordResetToken: hashToken(rawToken),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw httpError('Reset link is invalid or has expired', 400);

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Security best practice: reset kills every existing session.
  await revokeAllUserTokens(
  user._id,
  'User'
);
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
