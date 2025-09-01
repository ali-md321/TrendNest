const PushSubscription = require('../models/PushSubscriptionModel');

async function getUserPushSubscriptions(userId) {
  return await PushSubscription.find({ user: userId }).lean();
}

module.exports = { getUserPushSubscriptions };
