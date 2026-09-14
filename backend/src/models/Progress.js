const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * One document per (student, lesson) pair. Powers "mark lesson completed",
 * course/chapter progress bars, and the dashboard's "continue learning".
 */
const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchTimeSeconds: { type: Number, default: 0 }, // lets "resume where you left off" work
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
