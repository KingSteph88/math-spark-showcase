const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Free, one-to-many live sessions. Students only ever read these
 * (list/view); all create/edit/delete/notify actions are teacher-only.
 */
const liveSessionSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', default: null }, // optional link to a course

    title: { type: String, required: true },
    description: { type: String },

    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60 },

    platform: { type: String, enum: ['google_meet', 'zoom'], default: 'google_meet' },
    meetingLink: { type: String, required: true },

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    targetAudience: { type: String, enum: ['all', 'specific'], default: 'all' },
    targetStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }], // used when targetAudience = 'specific'

    notifiedStudents: { type: Boolean, default: false },
  },
  { timestamps: true }
);

liveSessionSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
