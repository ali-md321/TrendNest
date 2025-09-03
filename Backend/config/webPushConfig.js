// config/webPushConfig.js
const webpush = require('web-push');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys not set. Push notifications disabled.');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT || 'mailto:uniqueguy3212005@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function sendPushNotification(subscription, payload) {
  if (!subscription || !subscription.endpoint) {
    throw new Error('Invalid subscription: missing endpoint');
  }

  // normalize keys shape (some DB shapes store differently)
  const sub = {
    endpoint: subscription.endpoint,
    keys: subscription.keys || subscription.key || subscription.keys || {}
  };

  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  try {
    return await webpush.sendNotification(sub, body);
  } catch (err) {
    // bubble useful info
    err.info = { statusCode: err.statusCode, body: err.body };
    throw err;
  }
}

module.exports = { webpush, sendPushNotification };
