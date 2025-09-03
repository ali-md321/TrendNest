const router = require('express').Router();
const PushSubscription = require('../models/PushSubscriptionModel');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const catchAsync = require('../middlewares/catchAsync');
const { sendPushNotification } = require('../config/webPushConfig');

router.get('/push/public-key', (req,res)=>{
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

// routes/pushRoutes.js (or wherever)
router.post('/push/subscribe', isAuthenticated, catchAsync(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, message: "Invalid subscription" });
  }

  // Save whole subscription object (endpoint + keys + expirationTime)
  await PushSubscription.updateOne(
    { user: req.userId, endpoint: subscription.endpoint },
    {
      $set: {
        user: req.userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys || {},
        raw: subscription
      }
    },
    { upsert: true }
  );

  return res.json({ success: true });
}));


router.post('/push/unsubscribe', isAuthenticated , catchAsync(async (req,res)=>{
  const { endpoint } = req.body;
  await PushSubscription.deleteOne({ user:req.userId, endpoint });
  res.json({ ok:true });
}));

router.post('/push/test', isAuthenticated, catchAsync(async (req, res) => {
  const { title, message, route } = req.body;
  const subs = await PushSubscription.find({ user: req.userId });
  if (!subs.length) return res.status(404).json({ success: false, message: 'No subscriptions' });

  const payload = { title: title || 'TrendNest', message: message || '', route: route || '/' };

  const results = await Promise.allSettled(subs.map(s => {
    if (!s || !s.endpoint) return Promise.reject(new Error('missing endpoint'));
    const subObj = { endpoint: s.endpoint, keys: s.keys || s.raw?.keys || {} };
    return sendPushNotification(subObj, payload);
  }));

  // remove expired or invalid subs
  const failedToRemove = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const s = subs[i];
    if (r.status === 'rejected') {
      const sc = r.reason?.statusCode;
      if (sc === 404 || sc === 410) {
        failedToRemove.push(s._id);
      } else {
        console.error('Push error for', s._id, r.reason?.message || r.reason);
      }
    }
  }
  if (failedToRemove.length) {
    await PushSubscription.deleteMany({ _id: { $in: failedToRemove } });
  }

  const sent = results.filter(r => r.status === 'fulfilled').length;
  res.json({ success: true, sent, total: subs.length });
}));

module.exports = router;
