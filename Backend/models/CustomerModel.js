const BaseUser = require('./BaseUserModel');
const mongoose = require('mongoose');
const { deleteCustomerCascade } = require('./cascadeHelpers');

const CustomerSchema = new mongoose.Schema({
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{
    _id: false,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
  }],
  walletBalance: { type: Number, default: 0 },
  savedForLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  reviewRatings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReviewRating' }],
});

// Cascade deletion middlewares
CustomerSchema.pre('remove', async function (next) {
  try {
    await deleteCustomerCascade(this._id, { session: null, hardDeleteOrders: true });
    next();
  } catch (err) {
    next(err);
  }
});

CustomerSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  try {
    await deleteCustomerCascade(doc._id, { hardDeleteOrders: true });
  } catch (e) {
    console.error(e);
  }
});

module.exports = BaseUser.discriminator('Customer', CustomerSchema);
