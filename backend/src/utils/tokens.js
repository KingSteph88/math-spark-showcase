const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Short-lived JWT the client sends as `Authorization: Bearer <token>` on
 * every request. Never stored in the DB — verified purely by signature.
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Raw, random, opaque tokens used for refresh tokens, email verification,
 * and password reset links. The RAW token goes to the client/email; only
 * its SHA-256 hash is ever stored in MongoDB (see hashToken), so a leaked
 * database dump can't be replayed as a valid token.
 */
function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateRawToken, hashToken };
