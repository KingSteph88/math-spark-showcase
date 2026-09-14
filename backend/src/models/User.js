const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * STUDENT account lifecycle
 *
 * 1. Student chooses a plan and registers
 *        -> pending_email_verification
 *
 * 2. Student verifies their email
 *        -> pending_approval
 *
 * 3. Admin reviews and approves the account
 *        -> active
 *
 * 4. Active students can log in
 *
 * 5. Subscription expires
 *        -> expired
 *
 * 6. Admin can suspend the account
 *        -> suspended
 */
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    profilePicture: { type: String, default: null }, // URL in object storage (S3/Cloudinary/etc.)
    status: {
      type: String,
      enum: [
        'pending_email_verification',
        'pending_approval',
        'active',
        'suspended',
        'expired'
      ],
      default: 'pending_email_verification',
      index: true,
    },

    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date },

    // Set when an admin/teacher manually confirms the account after payment
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
    confirmedAt: { type: Date, default: null },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date },

    subscription: {
      planId: { type: Schema.Types.ObjectId, ref: 'PaymentPlan' },
      startDate: { type: Date },
      endDate: { type: Date },
      status: {
        type: String,
        enum: ['inactive', 'active', 'expired', 'cancelled'],
        default: 'inactive',
      },
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'subscription.endDate': 1 });

module.exports = mongoose.model('User', userSchema);
