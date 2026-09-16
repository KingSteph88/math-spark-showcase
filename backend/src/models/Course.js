const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema(
  {
    title: { type: String, required: true }, 
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    coverImage: { type: String },
    // Which branch of the curriculum this course belongs to. Drives
    // plan-based gating (see subjectAccessService).
    subject: {
      type: String,
      enum: ['analysis', 'algebra'],
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ subject: 1, isPublished: 1 });

module.exports = mongoose.model('Course', courseSchema);
