require('dotenv').config();
const mongoose = require('mongoose');

/**
 * One-off migration for the plan-gating + visibility changes.
 *
 * Run once against each environment:
 *   node src/scripts/migrateSubjectsAndPublishing.js
 *
 * It is idempotent — running it twice is harmless.
 *
 * What it does:
 *  1. Tags every PaymentPlan that has no subjectAccess as 'both'
 *     (existing subscribers keep the access they already had).
 *  2. Tags every Course that has no subject as 'analysis', guessing
 *     'algebra' from the title where it obviously applies. REVIEW the
 *     output and fix any course it guessed wrong.
 *  3. Publishes existing courses/chapters/lessons that were created
 *     before isPublished defaulted to true, which is why students
 *     couldn't see chapters their teacher had already added.
 */
async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  console.log('Connected.\n');

  const { PaymentPlan, Course, Chapter, Lesson } = require('../models');

  /* 1. Payment plans ------------------------------------------------ */
  const plans = await PaymentPlan.updateMany(
    { subjectAccess: { $in: [null, ''] } },
    { $set: { subjectAccess: 'both' } }
  );
  console.log(`PaymentPlan: tagged ${plans.modifiedCount} plan(s) as 'both'.`);
  console.log("  -> Set your analysis-only / algebra-only plans by hand:");
  console.log("     db.paymentplans.updateOne({name:'...'},{$set:{subjectAccess:'analysis'}})\n");

  /* 2. Courses ------------------------------------------------------ */
  const untagged = await Course.find({
    $or: [{ subject: { $exists: false } }, { subject: null }],
  }).lean();

  for (const course of untagged) {
    const haystack = `${course.title} ${course.slug || ''}`.toLowerCase();
    const subject = /alg[eè]br|algebra|matri|vector|espace vectoriel/.test(haystack)
      ? 'algebra'
      : 'analysis';

    await Course.updateOne({ _id: course._id }, { $set: { subject } });
    console.log(`Course: "${course.title}" -> ${subject}`);
  }
  if (untagged.length) console.log('  -> Review the guesses above.\n');
  else console.log('Course: nothing to tag.\n');

  /* 3. Publishing --------------------------------------------------- */
  const c = await Course.updateMany({ isPublished: false }, { $set: { isPublished: true } });
  const ch = await Chapter.updateMany({ isPublished: false }, { $set: { isPublished: true } });
  const l = await Lesson.updateMany({ isPublished: false }, { $set: { isPublished: true } });

  console.log(
    `Published: ${c.modifiedCount} course(s), ${ch.modifiedCount} chapter(s), ${l.modifiedCount} lesson(s).`
  );
  console.log('  -> Unpublish anything that was a genuine draft.\n');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
