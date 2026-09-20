const { sweepExpiredSubscriptions } = require('../services/subscriptionService');
const { sendEmail, subscriptionExpiredEmail } = require('../utils/email');

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Proactively expires subscriptions that have run past their end date and
 * emails each affected student, instead of waiting for them to try
 * logging in (which authService.login also guards, as a lazy fallback).
 *
 * No extra dependency (e.g. node-cron) is needed for an interval this
 * coarse — setInterval is enough. Swap this for node-cron if you later
 * want a fixed time of day rather than "every N hours since boot".
 */
async function runExpirySweep() {
  try {
    const justExpired = await sweepExpiredSubscriptions();

    for (const user of justExpired) {
      const { subject, html } = subscriptionExpiredEmail(user.firstName);
      // eslint-disable-next-line no-await-in-loop
      await sendEmail({ to: user.email, subject, html });
    }

    if (justExpired.length > 0) {
      console.log(`Subscription sweep: expired ${justExpired.length} account(s).`);
    }
  } catch (err) {
    console.error('Subscription sweep failed:', err);
  }
}

/**
 * Starts the recurring sweep. Call once at boot, after the DB connection
 * is established.
 */
function startSubscriptionExpiryJob() {
  runExpirySweep();
  return setInterval(runExpirySweep, ONE_HOUR_MS);
}

module.exports = { startSubscriptionExpiryJob, runExpirySweep };
