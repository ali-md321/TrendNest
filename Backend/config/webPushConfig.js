// backend/config/webPush.js
const webPush = require("web-push");

webPush.setVapidDetails(
  "mailto:uniqueguy3212005@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushNotification(subscription, payload) {
  // subscription must be a JS object (not string)
  const sub = (typeof subscription === 'string') ? JSON.parse(subscription) : subscription;
  return webPush.sendNotification(sub, JSON.stringify(payload));
}

module.exports = {
  sendPushNotification,
  webPush
};

