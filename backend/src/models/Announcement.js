const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },

    title: { type: String, required: true },
    content: { type: String, required: true },

    isPinned: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    scheduledAt: { type: Date, default: null }, // for "schedule announcements"
    publishedAt: { type: Date, default: Date.now },

    targetAudience: { type: String, enum: ['all', 'specific'], default: 'all' },
    targetStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

announcementSchema.index({ isPinned: -1, publishedAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
