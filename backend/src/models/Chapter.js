const mongoose = require('mongoose');
const { Schema } = mongoose;

const chapterSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    learningObjectives: [{ type: String }],
    order: { type: Number, default: 0 }, // controls reordering within a course
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chapterSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
