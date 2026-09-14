const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A single concrete, clickable time slot a student can request.
 * Generated from AvailabilityTemplate (or added one-off by a teacher).
 *
 * status flow:
 *   'open'      -> visible to students, nobody has requested it yet
 *   'requested' -> a student clicked it; a pending Booking now references it
 *   'booked'    -> the teacher accepted the request
 *   'blocked'   -> teacher manually blocked it (holiday, unavailable, etc.)
 */
const availabilitySlotSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    date: { type: Date, required: true }, // calendar day, midnight UTC
    startTime: { type: Date, required: true }, // exact start datetime
    endTime: { type: Date, required: true }, // exact end datetime

    status: {
      type: String,
      enum: ['open', 'requested', 'booked', 'blocked'],
      default: 'open',
      index: true,
    },

    sourceTemplateId: { type: Schema.Types.ObjectId, ref: 'AvailabilityTemplate', default: null },
  },
  { timestamps: true }
);

availabilitySlotSchema.index({ teacherId: 1, startTime: 1 }, { unique: true });
availabilitySlotSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
