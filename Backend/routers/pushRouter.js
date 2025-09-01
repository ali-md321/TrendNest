const router = require('express').Router();
const PushSubscription = require('../models/PushSubscriptionModel');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const catchAsync = require('../middlewares/catchAsync');
const { sendPushNotification } = require('../config/webPushConfig');

router.get('/push/public-key', (req,res)=>{
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.post('/push/subscribe', isAuthenticated , catchAsync(async (req,res)=>{
   const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: "Invalid subscription" });
    }

    // Save to DB (attach user if logged in)
     await PushSubscription.updateOne(
      { user: req.userId, endpoint: subscription.endpoint },
      {
        $set: {
          keys: subscription.keys,
        },
      },
      { upsert: true }
    );

    res.json({ success: true });
}));

router.post('/push/unsubscribe', isAuthenticated , catchAsync(async (req,res)=>{
  const { endpoint } = req.body;
  await PushSubscription.deleteOne({ user:req.userId, endpoint });
  res.json({ ok:true });
}));

router.post('/push/test', isAuthenticated, catchAsync(async (req, res) => {
  const { title, message, route } = req.body;

  // Example: load subscriptions from DB (replace with your model)
  const subscriptions = await PushSubscription.find({ user: req.userId });
  if (!subscriptions.length) return res.status(404).json({ success:false, message: 'No subscriptions' });

  const payload = { title, message, route };

  const results = [];
  for (const s of subscriptions) {
    try {
        const subObj = {
        endpoint: s.endpoint,
        keys: s.keys,
        expirationTime: null
      };      
      await sendPushNotification(subObj, payload);
      results.push({ id: s._id, status: 'ok' });
    } catch (err) {
      console.error('Push send error for', s._id, err.message || err);
      // optional: remove expired subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: s._id });
      }
      results.push({ id: s._id, status: 'failed', error: err.message });
    }
  }

  res.json({ success: true, results });
}));


module.exports = router;
