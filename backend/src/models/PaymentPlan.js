const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Plans offered on the pricing page (one-time / monthly / per-semester).
 * Kept in the DB (rather than hardcoded) so admins can adjust pricing
 * without a redeploy.
 */
const paymentPlanSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Monthly Access", "Full Semester"
    type: { type: String, enum: ['one_time', 'monthly', 'semester'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'TND' },
    durationDays: { type: Number, required: true }, // how long access lasts once activated

    // Which course subjects this plan unlocks. 'both' is the full pack.
    subjectAccess: {
      type: String,
      enum: ['analysis', 'algebra', 'both'],
      required: true,
      default: 'both',
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
