const { User } = require('../models');

/**
 * Subscription expiry lives here so both the login path (a lazy safety
 * net) and the scheduled sweep (src/jobs/expireSubscriptions.js, the
 * proactive path) share one source of truth for what "expired" means.
 */

/**
 * If `user`'s subscription end date has passed but the account is still
 * marked 'active', flip it to 'expired' and persist it.
 *
 * Returns true if the user was just transitioned (caller is responsible
 * for notifying them), false if nothing changed.
 */
async function expireIfPastDue(user) {
  const endDate = user.subscription && user.subscription.endDate;

  if (!endDate || endDate >= new Date()) return false;
  if (user.status !== 'active') return false;

  user.status = 'expired';
  user.subscription.status = 'expired';
  await user.save();

  return true;
}

/**
 * Find every active user whose subscription has already ended and expire
 * them. Returns the list of users that were just transitioned, so the
 * caller can email each one.
 */
async function sweepExpiredSubscriptions() {
  const candidates = await User.find({
    status: 'active',
    'subscription.endDate': { $lt: new Date() },
  });

  const justExpired = [];

  for (const user of candidates) {
    // Re-check with expireIfPastDue rather than trusting the query alone,
    // in case something else touched the document between the find and
    // the save (e.g. an admin re-activating the account seconds earlier).
    // eslint-disable-next-line no-await-in-loop
    if (await expireIfPastDue(user)) {
      justExpired.push(user);
    }
  }

  return justExpired;
}

module.exports = { expireIfPastDue, sweepExpiredSubscriptions };
