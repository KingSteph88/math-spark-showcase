const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A single payment transaction. A new User starts in 'pending_payment';
 * once a Payment for them reaches 'completed', the User flips to
 * 'pending_confirmation' and waits on an admin to confirm the account.
 */
const paymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'PaymentPlan', required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'TND' },

    provider: { type: String, enum: ['stripe', 'paypal', 'flouci', 'bank_transfer', 'other'] },
    providerTransactionId: { type: String },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
