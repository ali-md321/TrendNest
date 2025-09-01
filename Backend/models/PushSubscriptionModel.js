const mongoose = require('mongoose');

const subSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  endpoint: String,
  keys: { p256dh: String, auth: String },
  userAgent: String
}, { timestamps: true });

subSchema.index({ user: 1, endpoint: 1 }, { unique: true });
module.exports = mongoose.model('PushSubscription', subSchema);
