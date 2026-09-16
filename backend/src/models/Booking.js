const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A student's request for a private session on one of the teacher's
 * AvailabilitySlot documents.
 *
 * Flow:
 *   1. Student clicks an open slot -> Booking created with status 'pending',
 *      the AvailabilitySlot flips to 'requested'.
 *   2. Teacher accepts:
 *        - Booking.status -> 'accepted'
 *        - AvailabilitySlot.status -> 'booked'
 *        - a Google Calendar event is created -> googleCalendarEventId + meetingLink stored
 *        - confirmation email sent to the student
 *      Teacher declines:
 *        - Booking.status -> 'declined'
 *        - AvailabilitySlot.status -> back to 'open'
 *   3. After the session takes place a job (or the teacher) can mark it 'completed'.
 *   4. Either side can cancel an accepted booking -> 'cancelled', slot reopened.
 */
const bookingSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'AvailabilitySlot', required: true, index: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },

    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },

    googleCalendarEventId: { type: String, default: null },
    meetingLink: { type: String, default: null }, // Google Meet/Zoom link once accepted

    studentNote: { type: String },
    teacherNote: { type: String },
  },
  { timestamps: true }
);

// A slot can only have ONE live booking at a time, but a declined or
// cancelled booking must not block the slot from being requested again —
// hence a partial unique index rather than `unique: true` on the field.
bookingSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  }
);
bookingSchema.index({ teacherId: 1, status: 1 });
bookingSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
