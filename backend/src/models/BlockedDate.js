const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Whole-day blocks (holidays, days off) that stop slot generation for a
 * teacher, independent of any single AvailabilitySlot.
 */
const blockedDateSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    date: { type: Date, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

blockedDateSchema.index({ teacherId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
