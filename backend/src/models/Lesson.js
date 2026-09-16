const mongoose = require('mongoose');
const { Schema } = mongoose;

const lessonSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true }, // denormalized for fast lookups

    title: { type: String, required: true },
    description: { type: String },

    // Lessons are hosted on YouTube: the teacher pastes a link, we store the
    // canonical watch URL plus the extracted id so the player can embed it
    // without re-parsing on every render.
    videoUrl: { type: String },
    youtubeVideoId: { type: String },
    videoDurationSeconds: { type: Number },

    // Resources attached directly to this lesson (in addition to the general Resource library)
    downloadableResources: [
      {
        resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
      },
    ],

    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

lessonSchema.index({ chapterId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
