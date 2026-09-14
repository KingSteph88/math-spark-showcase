const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema(
  {
    title: { type: String, required: true }, 
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    coverImage: { type: String },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
