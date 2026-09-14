const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Single collection for the whole resource library (formula sheets, course
 * summaries, exercise series, previous exams, corrections). `category`
 * drives which fields are relevant and how the frontend groups/filters them.
 */
const resourceSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['formula_sheet', 'course_summary', 'exercise_series', 'previous_exam', 'correction'],
      required: true,
      index: true,
    },

    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' }, // used to organize exercise_series by chapter

    fileUrl: { type: String, required: true },
    fileType: { type: String }, // pdf, docx, etc.
    fileSizeBytes: { type: Number },

    // exercise_series only
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },

    // previous_exam only
    examYear: { type: Number },

    // correction only: links a correction back to the exam/exercise it solves
    linkedResourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },

    uploadedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    downloadsCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

resourceSchema.index({ category: 1, courseId: 1 });
resourceSchema.index({ title: 'text' }); // enables the "search" requirement for formula sheets etc.

module.exports = mongoose.model('Resource', resourceSchema);
