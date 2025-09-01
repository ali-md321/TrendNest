const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: { type: String, enum: ['Customer','Seller','Deliverer','Admin'], index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: [
    "ORDER_PLACED","NEW_ORDER", "ORDER_CANCELLED","ORDER_CANCELLED_BY_CUSTOMER", "RETURN_REQUEST","WISHLIST","REVIEW","DELIVERER_RATING","WELCOME","PRODUCT_ADDED","PRICE_DROPPED","ORDER_SHIPPED","DELIVERY_ASSIGNED","RETURN_ACCEPTED","REFUND_PROCESSED","ORDER_REJECTED","BACK_IN_STOCK","ORDER_DELIVERED","DELIVERY_FAILED","RETURN_PICKED","REFUND_NEEDED","ORDER_REMINDER","REVIEW_REMINDER","LOW_STOCK_ALERT","PENDING_ORDER_SHIPMENT","RETURN_PICKUP_REMINDER",
  ], index: true },
  route: { type: String,default : "/"},
  meta: { type: Object },
  seenAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
