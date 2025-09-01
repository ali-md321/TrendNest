const BaseUser = require('./BaseUserModel');
const mongoose = require('mongoose');
const { deleteSellerCascade } = require('./cascadeHelpers');

const activitySchema = new mongoose.Schema({
  week: String, // Example: "Aug 12 - Aug 18"
  count: { type: Number, default: 0 }
}, { _id: false });

const SellerSchema =  new mongoose.Schema({
  shopName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  businessAddress: { type: String, required: true },
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  socialHandles: {
    website: String,
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
  },
  NoOfOrders : {type : Number,default : 0},
  avgRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  productActivity: { type: [activitySchema], default: [] },
  reviewActivity: { type: [activitySchema], default: [] },
  addedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

SellerSchema.pre('remove', async function(next) {
  try {
    await deleteSellerCascade(this._id);
    next();
  } catch (err) { next(err); }
});

SellerSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  try { await deleteSellerCascade(doc._id); } catch (e) { console.error(e); }
});

module.exports = BaseUser.discriminator('Seller',SellerSchema);
