const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * TEACHER / ADMIN account. Lives on the separate teacher/admin platform
 * with its own auth so students can never reach these routes.
 */
const teacherSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ['teacher', 'admin'], default: 'teacher', index: true },

    profilePicture: { type: String, default: null },
    bio: { type: String },
    subjects: [{ type: String }], // e.g. ['analysis', 'algebra']

    status: { type: String, enum: ['active', 'suspended'], default: 'active' },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

teacherSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
