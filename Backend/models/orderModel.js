const mongoose = require('mongoose');
const { deleteOrderCascade } = require('./cascadeHelpers');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String },
  address: { type: String},
  city: { type: String },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String },
  addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' },
  lat: { type: Number,required: true  },   // new
  lng: { type: Number,required: true  }    // new
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice:    { type: Number, required: true },
  productDeleted: { type: Boolean, default: false },
  deletedProductSnapshot: {
    name: String,
    price: Number,
    images: [String],
    category: String,
    seller : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
});

const orderSchema = new mongoose.Schema({
  user : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productDetails : orderItemSchema,
  address : addressSchema,
  deliverer : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  paymentMethod : { type: String, enum: ['COD', 'UPI', 'CARD', 'ONLINE', 'WALLET', 'WALLET+ONLINE'], default: 'COD' },
  paymentStatus : { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentInfo: {
    walletDeducted: { type: Number, default: 0 },
    paymentIntentId: { type: String },
    method: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String }
  },
  orderStatus : {
    type: String,
    enum: ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', "ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded", "Rejected"],
    default: 'Placed'
  },
  review : {type: mongoose.Schema.Types.ObjectId, ref: 'ReviewRating'},
  deliveryRating: {type : Number, default : 0},
  expectedDelivery: { type: Date,default : () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)},
  orderedAt:{ type: Date, default: Date.now },
  shippedAt:{ type: Date, default:null },
  deliveredAt:{ type: Date, default:null },
  returnRequestAt:{ type: Date, default: null },
  returnAcceptedAt:{ type: Date, default:null },
  returnPickedUpAt:{ type: Date, default:null },
  refundedAt:{ type: Date, default: null },
  cancelledAt:{ type: Date, default:null },
  rejectedAt : {type : Date,default : null}
}, { timestamps: true });


orderSchema.pre('remove', async function(next) {
  try {
    await deleteOrderCascade(this._id);
    next();
  } catch (err) { next(err); }
});

orderSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  try { await deleteOrderCascade(doc._id); } catch (e) { console.error(e); }
});

orderSchema.pre('deleteMany', async function(next) {
  const docs = await this.model.find(this.getFilter()).select('_id');
  this._docsToCascade = docs.map(d => d._id);
  next();
});
orderSchema.post('deleteMany', async function() {
  if (!this._docsToCascade) return;
  for (const id of this._docsToCascade) {
    try { await deleteOrderCascade(id); } catch (e) { console.error(e); }
  }
});


module.exports = mongoose.model('Order', orderSchema);
