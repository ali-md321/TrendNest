const Notification = require('../models/NotificationModel');
const PushSubscription = require('../models/PushSubscriptionModel');
const {webPush} = require("../config/webPushConfig");
const { getUserActiveSocketIds, getIO } = require('../config/socketBackend');

async function notifyUser(userId, payload) {

const doc = await Notification.create({
    user: userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    route: payload.route || "/",
    meta: payload.meta || {},
  })
  // 1) Real-time Socket.IO
  const socketIds = getUserActiveSocketIds(userId);
  if (socketIds.length > 0) {
    const io = getIO();
    io.to(`user:${userId}`).emit("notification:new", {
      _id: doc._id,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      route: doc.route,
      meta: doc.meta,
      createdAt: doc.createdAt,
      readAt: doc.readAt,
    });
    return doc;
  }

  // 2) Web Push fallback
  const sub = await PushSubscription.findOne({ user: userId });
  if (sub) {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      url: payload.route || "/",
      tag: `notif-${doc._id}`,
      requireInteraction: true, // stays until action
    });
    try {
      await webPush.sendNotification(sub.subscription, pushPayload);
    } catch (err) {
      console.error("web-push error:", err?.message || err);
    }
  }

  return doc;
};

module.exports = { notifyUser };
