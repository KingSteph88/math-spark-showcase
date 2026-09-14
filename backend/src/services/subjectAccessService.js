const { User } = require('../models');

/**
 * Resolves which course subject(s) a student is allowed to see, based on
 * their subscription's PaymentPlan.subjectAccess.
 *
 * Falls back to 'both' if the student has no plan attached (e.g. legacy
 * accounts, or plans that predate this field) so existing accounts aren't
 * unexpectedly locked out — plans should be tagged with subjectAccess to
 * get real gating.
 */
async function getSubjectAccess(userId) {
  const user = await User.findById(userId).populate({
    path: 'subscription.planId',
    select: 'subjectAccess',
  });

  const access = user?.subscription?.planId?.subjectAccess;

  return access || 'both';
}

/**
 * Mongo filter fragment to scope a Course query to what a given subject
 * access level allows.
 */
function courseFilterForAccess(subjectAccess) {
  if (subjectAccess === 'both') return {};
  return { subject: subjectAccess };
}

module.exports = { getSubjectAccess, courseFilterForAccess };