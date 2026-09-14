const { User, PaymentPlan } = require('../models');
const {
  sendEmail,
  approvalEmail
} = require('../utils/email');
const {
  revokeAllUserTokens,
} = require('./tokenService');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Return every student waiting for approval.
 */
async function getPendingUsers() {

  const users = await User.find({
    status: 'pending_approval'
  })
    .populate({
      path: 'subscription.planId',
      select: 'name price durationDays',
    })
    .sort({ createdAt: 1 });

  return users.map(toAdminUser);
}
/**
 * Return all users for admin management.
 * Optional status filtering.
 */
async function getAllUsers(status) {

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const users = await User.find(filter)
    .populate({
      path: 'subscription.planId',
      select: 'name price durationDays',
    })
    .sort({ createdAt: -1 });


  return users.map(toAdminUser);
}
function toAdminUser(user) {
    return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        subscription: user.subscription,
        confirmedAt: user.confirmedAt,
    };
}
/**
 * Approve a student account.
 */
async function approveUser(userId, adminId) {

  // Find the student
  const user = await User.findById(userId);

  if (!user) {
    throw httpError('Student not found', 404);
  }

  // Only pending users can be approved
  if (user.status !== 'pending_approval') {
    throw httpError(
      'This account is not awaiting approval.',
      400
    );
  }

  // Load the selected plan
  const plan = await PaymentPlan.findById(
    user.subscription.planId
  );

  if (!plan) {
    throw httpError(
      'Payment plan not found.',
      404
    );
  }

  const startDate = new Date();

  const endDate = new Date(startDate);

  endDate.setDate(
    endDate.getDate() + plan.durationDays
  );

  user.status = 'active';

  user.subscription.status = 'active';
  user.subscription.startDate = startDate;
  user.subscription.endDate = endDate;

  user.confirmedAt = new Date();

  // We don't have admin authentication yet.
  user.confirmedBy = adminId;

  await user.save();
  const { subject, html } = approvalEmail(user.firstName);
    await sendEmail({
    to: user.email,
    subject,
    html
    });

  return toAdminUser(user);
}

/**
 * Suspend a user account.
 */


async function suspendUser(userId, adminId) {

  const user = await User.findById(userId);


  if (!user) {
    throw httpError(
      'User not found',
      404
    );
  }


  if (user.status === 'suspended') {
    throw httpError(
      'User is already suspended.',
      400
    );
  }


  user.status = 'suspended';

  user.suspendedAt = new Date();

  user.suspendedBy = adminId;


  await user.save();


  // Kill all active refresh sessions
  await revokeAllUserTokens(
    user._id,
    'User'
  );


  return toAdminUser(user);
}

/**
 * Reactivate a suspended user.
 */
async function activateUser(userId, adminId) {

  const user = await User.findById(userId);

  if (!user) {
    throw httpError(
      'User not found',
      404
    );
  }

  if (user.status !== 'suspended') {
    throw httpError(
      'Only suspended users can be activated.',
      400
    );
  }

  user.status = 'active';

  user.activatedAt = new Date();
  user.activatedBy = adminId;

  await user.save();

  return toAdminUser(user);
}

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  suspendUser,
  activateUser,
};