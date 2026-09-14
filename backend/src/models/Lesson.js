const mongoose = require('mongoose');
const { Schema } = mongoose;

const lessonSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true }, // denormalized for fast lookups

    title: { type: String, required: true },
    description: { type: String },

    videoUrl: { type: String }, // storage URL (e.g. S3/Bunny/Mux) for the lesson video
    videoDurationSeconds: { type: Number },

    // Resources attached directly to this lesson (in addition to the general Resource library)
    downloadableResources: [
      {
        resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
      },
    ],

    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ chapterId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
