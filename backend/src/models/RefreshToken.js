const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Stores refresh tokens (hashed) so sessions can be revoked (logout,
 * suspension, password reset) instead of trusting a stateless JWT forever.
 * Shared by both Users and Teachers via `userType`.
 */
const refreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true, refPath: 'userType' },
    userType: { type: String, enum: ['User', 'Teacher'], required: true },

    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },

    userAgent: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-cleanup

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
