const RefreshToken = require('../models/RefreshToken');
const {
  generateRawToken,
  hashToken,
} = require('../utils/tokens');

const REFRESH_TOKEN_DAYS =
  Number(process.env.REFRESH_TOKEN_DAYS || 30);

async function issueRefreshToken(
  { userId, userType },
  meta = {}
) {
  const rawToken = generateRawToken();

  await RefreshToken.create({
    tokenHash: hashToken(rawToken),
    userId,
    userType,
    expiresAt: new Date(
      Date.now() +
      REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
    ),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return rawToken;
}
async function findValidRefreshToken(rawToken) {
  return RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
    revoked: false,
    expiresAt: { $gt: new Date() },
  });
}
async function revokeRefreshToken(rawToken) {
  return RefreshToken.updateOne(
    {
      tokenHash: hashToken(rawToken),
    },
    {
      revoked: true,
    }
  );
}
async function revokeAllUserTokens(userId, userType) {
  return RefreshToken.updateMany(
    {
      userId,
      userType,
      revoked: false,
    },
    {
      revoked: true,
    }
  );
}
async function rotateRefreshToken(rawToken, meta = {}) {

  const stored = await findValidRefreshToken(rawToken);

  if (!stored) {
    throw new Error('Invalid refresh token');
  }

  stored.revoked = true;

  await stored.save();

  const newRefreshToken =
    await issueRefreshToken(
      {
        userId: stored.userId,
        userType: stored.userType,
      },
      meta
    );

  return {
    stored,
    refreshToken: newRefreshToken,
  };

}
module.exports = {
  issueRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
};