const { Teacher } = require('../models');
const { comparePassword } = require('../utils/password');
const { signAccessToken, generateRawToken, hashToken } = require('../utils/tokens');
const { RefreshToken } = require('../models');

const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30);

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toPublicTeacher(teacher) {
  return {
    id: teacher._id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    role: teacher.role,
    status: teacher.status,
  };
}

async function issueRefreshToken(teacherId, meta = {}) {
  const rawToken = generateRawToken();
  await RefreshToken.create({
    tokenHash: hashToken(rawToken),
    userId: teacherId,
    userType: 'Teacher',
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
  return rawToken;
}

// No public self-registration — teachers/admins are created by seed script
// or by an existing admin (add an "invite teacher" endpoint later if needed).
async function login({ email, password }, meta = {}) {
  const teacher = await Teacher.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!teacher) throw httpError('Invalid email or password', 401);

  const validPassword = await comparePassword(password, teacher.passwordHash);
  if (!validPassword) throw httpError('Invalid email or password', 401);

  if (teacher.status !== 'active') throw httpError('This account has been suspended', 403);

  teacher.lastLoginAt = new Date();
  await teacher.save();

  const accessToken = signAccessToken({ sub: teacher._id.toString(), role: teacher.role , accountType : 'teacher'});
  const refreshToken = await issueRefreshToken(teacher._id, meta);

  return { accessToken, refreshToken, teacher: toPublicTeacher(teacher) };
}

async function refreshAccessToken(rawToken, meta = {}) {
  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
    userType: 'Teacher',
    revoked: false,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw httpError('Refresh token is invalid or has expired', 401);

  stored.revoked = true;
  await stored.save();

  const teacher = await Teacher.findById(stored.userId);
  if (!teacher || teacher.status !== 'active') throw httpError('Account is not active', 403);

  const newRefreshToken = await issueRefreshToken(stored.userId, meta);
  const accessToken = signAccessToken({ sub: stored.userId.toString(), role: teacher.role, accountType: 'teacher' });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(rawToken) {
  await RefreshToken.updateOne({ tokenHash: hashToken(rawToken), userType: 'Teacher' }, { revoked: true });
}

module.exports = { login, refreshAccessToken, logout, toPublicTeacher };