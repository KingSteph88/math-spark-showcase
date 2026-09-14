const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A teacher's recurring weekly availability pattern (e.g. "Mondays 5pm-8pm").
 * A background job/cron expands this template into concrete, bookable
 * AvailabilitySlot documents (e.g. a few weeks ahead on a rolling basis).
 */
const availabilityTemplateSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday ... 6 = Saturday
    startTime: { type: String, required: true }, // "17:00"
    endTime: { type: String, required: true }, // "20:00"
    sessionDurationMinutes: { type: Number, default: 60 }, // used to slice the window into bookable slots
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

availabilityTemplateSchema.index({ teacherId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('AvailabilityTemplate', availabilityTemplateSchema);
