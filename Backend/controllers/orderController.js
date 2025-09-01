const Order = require("../models/orderModel.js");
const Product = require("../models/productModel");
const Customer = require("../models/CustomerModel");
const Deliverer = require("../models/DelivererModel");
const Seller = require("../models/SellerModel.js");
const catchAsync = require("../middlewares/catchAsync");
const ReviewRating = require("../models/reviewRatingModel");
const ErrorHandler = require("../utils/ErrorHandler");

const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const { uploadImageToBucket, deleteImageFromBucket } = require("../config/googleCloudConfig");
const { updateWeeklyActivity } = require("../utils/relatedFunc.js");
const { notifyUser } = require("../services/notificationService.js");


async function finalizeOrderAtomic({ userId, productId, quantity, itemTotal, delivery, address, paymentMethod, paymentInfo }) {
  // Create order document
  const orderDoc = {
    user: userId,
    productDetails: {
      product: productId,
      quantity,
      totalPrice: itemTotal,
      delivery
    },
    address,
    paymentMethod,
    paymentInfo,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
  };

  const order = await Order.create(orderDoc);

  // Update user orders and product stock atomically using update queries (avoids save() on a possibly stale doc)
  await Customer.findByIdAndUpdate(
    userId,
    { $push: { orders: { $each: [order._id], $position: 0 } } }, // $position:0 puts it at the start
    { new: true }
  ).exec();
  await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } }).exec();

  return order;
}

exports.createPaymentController = catchAsync(async (req, res) => {
  const { amount, currency = 'inr', metadata = {} } = req.body;
  if (!amount) return res.status(400).json({ success: false, message: 'amount required in smallest currency unit' });

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }, // lets Stripe pick available PMs
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

exports.getPaymentIntentController = catchAsync(async (req, res) => {
  const pi = await stripe.paymentIntents.retrieve(req.params.id);
  res.json({ success: true, paymentIntent: pi });
});

exports.createRazorpayOrder = catchAsync(async (req, res) => {
  const { amount, currency = 'INR', metadata = {} } = req.body;
  if (!amount) return res.status(400).json({ success: false, message: 'amount required in paise' });

  // Put productId/qty into notes so we can retrieve them later in placeOrder
  const notes = { ...(metadata || {}) }; // e.g. { productId: 'xxx', qty: 2 }

  const options = {
    amount, // paise
    currency,
    receipt: `tn_receipt_${Date.now()}`,
    payment_capture: 1,
    notes,
  };

  const order = await razorpay.orders.create(options);
  res.json({ success: true, order });
});

exports.placeOrderController = catchAsync(async (req, res) => {
  const productId = req.params.productId || req.body.productId;
  const { quantity = 1, address = {}, paymentMethod, paymentResult } = req.body;
  const userId = req.userId; // must be set by your auth middleware
  if (!productId) throw new ErrorHandler('Product id missing', 400);

  // Fetch product (lean) to avoid doc version issues and to get pricing/stock
  const product = await Product.findById(productId).lean();
  if (!product) throw new ErrorHandler('Product not found', 404);
  if (product.stock < quantity) throw new ErrorHandler('Insufficient stock', 400);

  // Totals (rupees)
  const itemTotal = Number((product.discountedPrice || product.price || 0) * quantity);
  const delivery = itemTotal > 500 ? 0 : 40;
  const grandTotal = Number((itemTotal + delivery).toFixed(2)); // rupees
  const expectedPaise = Math.round(grandTotal * 100);

  // Ensure user exists
  const user = await Customer.findById(userId).lean();
  if (!user) throw new ErrorHandler('User not found', 404);
  
  // Helper to finalize order
  const finalize = async (paymentStatus, paymentInfo = null) => {
    const order = await finalizeOrderAtomic({
      userId,
      productId,
      quantity,
      itemTotal,
      delivery,
      address,
      paymentMethod,
      paymentInfo
    });
    return order;
  };
  let order;
  let isOrderPlaced = false;
  const seller = await Seller.findById(product.seller);
  if (paymentMethod === 'COD') {
    order = await finalize('Pending', null);
    isOrderPlaced = true;
  }

  // --- WALLET ONLY ---
  if (paymentMethod === 'WALLET') {
    if (typeof user.walletBalance !== 'number' || user.walletBalance < grandTotal) {
      throw new ErrorHandler('Insufficient wallet balance', 400);
    }
    // deduct wallet
    await Customer.findByIdAndUpdate(userId, { $inc: { walletBalance: -grandTotal } }).exec();
    order = await finalize('Paid', { walletDeducted: grandTotal, method: 'wallet' });
    isOrderPlaced = true;
  }

  // --- WALLET + ONLINE (Stripe or Razorpay) ---
  if (paymentMethod === 'WALLET+ONLINE') {
    if (!paymentResult) throw new ErrorHandler('Missing payment info', 400);
    const walletDeducted = Number(paymentResult.walletDeducted || 0);
    if (walletDeducted < 0) throw new ErrorHandler('Invalid wallet amount', 400);

    const remainingPaise = Math.round((grandTotal - walletDeducted) * 100);
    if (remainingPaise < 0) throw new ErrorHandler('Invalid amounts', 400);

    // Stripe flow
    if (paymentResult.paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentResult.paymentIntentId);
      if (!pi || pi.status !== 'succeeded') throw new ErrorHandler('Payment not completed', 400);
      if (pi.amount !== remainingPaise) throw new ErrorHandler('Payment amount mismatch', 400);

      // deduct wallet
      if (typeof user.walletBalance !== 'number' || user.walletBalance < walletDeducted) throw new ErrorHandler('Insufficient wallet balance', 400);
      await Customer.findByIdAndUpdate(userId, { $inc: { walletBalance: -walletDeducted } }).exec();

      order = await finalize('Paid', {
        paymentIntentId: pi.id,
        method: pi.payment_method_types?.[0] || 'card',
        walletDeducted
      });
      return res.status(201).json({ success: true, orderDetails: order });
    }

    // Razorpay flow
    if (paymentResult.razorpay_payment_id && paymentResult.razorpay_order_id && paymentResult.razorpay_signature) {
      const payload = paymentResult.razorpay_order_id + '|' + paymentResult.razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(payload).digest('hex');
      if (expectedSignature !== paymentResult.razorpay_signature) throw new ErrorHandler('Invalid Razorpay signature', 400);

      const payment = await razorpay.payments.fetch(paymentResult.razorpay_payment_id);
      if (!payment || payment.status !== 'captured') throw new ErrorHandler('Razorpay payment not captured', 400);
      if (payment.amount !== remainingPaise) throw new ErrorHandler('Razorpay amount mismatch', 400);

      if (typeof user.walletBalance !== 'number' || user.walletBalance < walletDeducted) throw new ErrorHandler('Insufficient wallet balance', 400);
      await Customer.findByIdAndUpdate(userId, { $inc: { walletBalance: -walletDeducted } }).exec();

      order = await finalize('Paid', {
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        method: 'upi',
        walletDeducted
      });
      return res.status(201).json({ success: true, orderDetails: order });
    }
    isOrderPlaced = true;
    throw new ErrorHandler('Unsupported online provider for WALLET+ONLINE', 400);
  }

  // --- UPI via Razorpay (no wallet) ---
  if (paymentMethod === 'UPI') {
    if (!paymentResult || !paymentResult.razorpay_payment_id) throw new ErrorHandler('Missing payment info', 400);
    const payload = paymentResult.razorpay_order_id + '|' + paymentResult.razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(payload).digest('hex');
    if (expectedSignature !== paymentResult.razorpay_signature) throw new ErrorHandler('Invalid Razorpay signature', 400);

    const payment = await razorpay.payments.fetch(paymentResult.razorpay_payment_id);
    if (!payment || payment.status !== 'captured') throw new ErrorHandler('Razorpay payment not captured', 400);
    if (payment.amount !== expectedPaise) throw new ErrorHandler('Razorpay amount mismatch', 400);

    order = await finalize('Paid', {
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      method: 'upi'
    });
    isOrderPlaced = true; 
  }

  // --- ONLINE (Stripe) ---
  if (paymentMethod === 'ONLINE' || paymentMethod === 'CARD') {
    if (!paymentResult || !paymentResult.paymentIntentId) throw new ErrorHandler('Missing payment info', 400);
    const pi = await stripe.paymentIntents.retrieve(paymentResult.paymentIntentId);
    if (!pi || pi.status !== 'succeeded') throw new ErrorHandler('Payment not completed', 400);
    if (pi.amount !== expectedPaise) throw new ErrorHandler('Payment amount mismatch', 400);

    order = await finalize('Paid', {
      paymentIntentId: pi.id,
      method: pi.payment_method_types?.[0] || 'card'
    });
    isOrderPlaced = true;
  }

  if(isOrderPlaced){
    if (seller) {
      seller.NoOfOrders = (seller.NoOfOrders || 0) + 1;
      await seller.save({ validateBeforeSave: false });
    }
    // send customer confirmation
    await notifyUser(req.userId, {
      type: "ORDER_PLACED",
      title: `Order confirmed — #${order._id}`,
      message: `${product.title} — Your order has been placed. Amount: ₹${grandTotal}.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id, productId : product._id,quantity : order.productDetails.quantity }
    });

    await notifyUser(seller._id, {
      type: "NEW_ORDER",
      title: `New order received (#${order._id})`,
      message: `${product.title} — Qty: ${order.productDetails.quantity}.`,
      route: `/shipment`,
      data: { orderId: order._id, productId : product._id,quantity : order.productDetails.quantity},
    });
    return res.status(201).json({ success: true, orderDetails: order });
  }

  throw new ErrorHandler('Unsupported payment method', 400);
});

exports.getAllOrdersController = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.userId })
    .populate("productDetails.product")
    .populate("review")
    .sort({ createdAt: -1 }); // newest first

  res.status(200).json({
    message: "All Order Details Fetched!..",
    orders,
  });
});

exports.getOrderDetailsController = catchAsync(async(req,res) => {
  const {orderId} = req.params;
  const order = await Order.findById(orderId)
              .populate("productDetails.product")
              .populate("review")
  res.status(201).json({
    message: 'Order Details Fetched!..',
    orderDetails: order,
  });  
})

exports.getAllReviewsController = catchAsync(async(req,res) => {
  const userId = req.userId;
  const user = await Customer.findById(userId)
    .populate({
      path: "reviewRatings",
      populate: {
        path: "product",
        select: "title images price"
      }
    });
  res.json({
    message : "Review fetched!..",
    reviewRatings : user.reviewRatings
  })
})

exports.addReviewRatingController = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId;
  const { rating, description, title } = req.body;
  const files = req.files;

  const order = await Order.findById(orderId);
  if (!order) throw new ErrorHandler('order Not found', 404);

  const product = await Product.findById(order.productDetails.product);
  if (!product) throw new ErrorHandler('Product Not found', 404);

  const uploadedImageUrls = [];
  for (const file of files) {
    const url = await uploadImageToBucket(file.buffer, `reviews/${Date.now()}_${file.originalname}`, file.mimetype);
    uploadedImageUrls.push(url);
  }

  const review = await ReviewRating.create({user: userId,product: product._id, order, rating, description,title,images: uploadedImageUrls});

  const user = await Customer.findById(userId);
  user.reviewRatings.unshift(review);
  product.reviews.unshift(review);
  order.review = review._id;
  
  const seller = await Seller.findById(product.seller);

  const prevTotal = seller.totalReviews; // store old total
  const prevRatings = seller.avgRating * prevTotal;
  const numRating = Number(rating);
  seller.totalReviews = prevTotal + 1; // increment AFTER storing old total
  const avgRating = (prevRatings + numRating) / (prevTotal + 1);

  seller.avgRating = avgRating;

  await seller.save({ validateBeforeSave: false });
  await updateWeeklyActivity(seller._id,"Seller", 'reviewActivity');
  await order.save();
  await product.save();
  await user.save({ validateBeforeSave: false });

  await notifyUser(product.seller.toString(), {
    type: "REVIEW",
    title: `New review for ${product.title}`,
    message: `${user.name || "A customer"} left ${rating}★ on ${product.title}: "${title || description?.slice(0,80)}"`,
    route: `/product/${product._id}`,
    data: { productId: product._id, reviewId: review._id, rating }
  });

  res.json({
    reviewRating: review,
    message: 'Review&Rating is Added!..',
  });
});

exports.editReviewRatingController = catchAsync(async (req, res) => {
  const { orderId, reviewId } = req.params;
  const {images} = req.body;
  const userId = req.userId;
  const files = req.files;

  const order = await Order.findById(orderId);
  if (!order) throw new ErrorHandler('order Not found', 404);
  const product = await Product.findById(order.productDetails.product);
  if (!product) throw new ErrorHandler('Product Not found', 404);

  const review = await ReviewRating.findById(reviewId);
  if (!review) throw new ErrorHandler('Review Not found', 404);
  
  const newImageUrls = [];
    for (const oldUrl of review.images) {
      if(images && images.includes(oldUrl)){
        newImageUrls.push(oldUrl);
      }else{
        await deleteImageFromBucket(oldUrl);
      }
    }
  for (const file of files) {
    const url = await uploadImageToBucket(file.buffer, `reviews/${Date.now()}_${file.originalname}`, file.mimetype);
    newImageUrls.push(url);
  }

  const seller = await Seller.findById(product.seller);

  const prevTotal = seller.totalReviews; // store old total
  const prevRatings = (seller.avgRating * prevTotal) - review.rating;
  const numRating = Number(req.body.rating || review.rating);
  const avgRating = (prevRatings + numRating) / (prevTotal);

  seller.avgRating = avgRating;
  review.title = req.body.title || review.title;
  review.description = req.body.description || review.description;
  review.rating = req.body.rating || review.rating;
  review.images = newImageUrls;

  await review.save();
  await seller.save({ validateBeforeSave: false });
  res.json({
    reviewRating: review,
    message: 'Review&Rating is Edited!..',
  });
});

exports.deleteReviewRatingController = catchAsync(async (req, res) => {
  const {orderId,reviewId} = req.params;

  const order = await Order.findById(orderId).populate("productDetails.product");
  if (!order) throw new ErrorHandler('order Not found', 404);
  const review = await ReviewRating.findByIdAndDelete(reviewId);
  if (!review) throw new ErrorHandler('Review Not found', 404);

  for (const url of review.images) {
    await deleteImageFromBucket(url);
  }
  order.review = null;
  await order.save();
  const seller = await Seller.findById(order.productDetails.product.seller);

  const prevTotal = seller.totalReviews; // store old total
  const prevRatings = (seller.avgRating * prevTotal) - review.rating;
  const avgRating = (prevRatings) / (prevTotal - 1);
  seller.totalReviews -= 1;
  seller.avgRating = avgRating;
  if(seller.totalReviews == 0) seller.avgRating = 0; 
  await seller.save({ validateBeforeSave: false });
  res.json({
    reviewRating: review,
    message: 'Review&Rating is Deleted!..',
  });
});

exports.getReviewRatingController = catchAsync(async(req,res) => {
    const {orderId,reviewId} = req.params;

    const order = await Order.findById(orderId);
    if (!order) throw new ErrorHandler('order Not found', 404);
    const product = await Product.findById(order.productDetails.product);
    if (!product) throw new ErrorHandler('Product Not found', 404);

    const review = await ReviewRating.findById(reviewId);

    res.json({
        reviewRating : review,
        message : "Review&Rating is fetched!.."
    })

})

exports.rateDelivererController = catchAsync(async (req, res) => {
  const {orderId} = req.params;
  let { rating } = req.body;
  rating = Number(rating);
  const order = await Order.findById(orderId);
  if (!order) throw new ErrorHandler("order not found",404);
  if (order.user?._id?.toString() !== req.userId) {
    throw new ErrorHandler("Not authorized to rate this product", 401);
  }
  order.deliveryRating = rating;
  const deliverer = await Deliverer.findById(order.deliverer);
  if (!deliverer) throw new ErrorHandler("Deliverer not found",404);

  const prevAvg = deliverer.performance.avgRating;
  const prevCount = deliverer.performance.ratingCount || 0;

  deliverer.performance.avgRating =
    ((prevAvg * prevCount) + rating) /
    (prevCount + 1);

  deliverer.performance.ratingCount = prevCount + 1;

  order.save({validateBeforeSave : false});
  await deliverer.save({validateBeforeSave : false});
  
  await notifyUser(order.deliverer.toString(), {
    type: "DELIVERER_RATING",
    title: `Delivery rating received (${rating}★)`,
    message: `You received a ${rating}★ rating for order ${order._id}.`,
    route: `/`,
    data: { orderId: order._id, rating }
  });

  res.json({ message: " Delivery Rating added successfully" });
})

exports.returnRequestController = catchAsync(async(req,res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) throw new ErrorHandler("Order not found",404);
    const product = await Product.findById(order.productDetails.product.toString());

    if (order.user?._id?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to return this order", 401);
    }
    const sevenDaysLater = new Date(order.orderedAt);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    if (new Date() > sevenDaysLater) {
      throw new ErrorHandler("Return window expired",400);
    }

    order.orderStatus = "ReturnRequest";
    order.returnRequestAt = new Date();
    await order.save({validateBeforeSave : false});

    await notifyUser(product.seller.toString(), {
      type: "RETURN_REQUEST",
      title: `Return requested for order #${order._id}`,
      message: `${product.title} — Buyer requested a return for order #${order._id}.`,
      route: `/returns-refunds`,
      data: { orderId: order._id, productId: product._id }
    });

    res.json({ message: "Return request placed", order });
})

exports.cancelOrderController = catchAsync(async(req,res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order)  throw new ErrorHandler("Order not found",404);
    const product = await Product.findById(order.productDetails.product.toString());
    if (order.user?._id?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to cancel this order", 401);
    }
    if (!['Placed', 'Confirmed', 'Shipped', 'Out for Delivery'].includes(order.orderStatus))
       throw new ErrorHandler("Invalid status for cancellation",400);

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    await order.save({validateBeforeSave : false});
    // notify customer
    await notifyUser(req.userId, {
      type: "ORDER_CANCELLED",
      title: `Order #${order._id} cancelled`,
      message: `Your order ${product.title}(${order._id}) has been cancelled successfully.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id }
    });
    // notify seller(s) (group by seller same as above)
    await notifyUser(product.seller.toString(), {
      type: "ORDER_CANCELLED_BY_CUSTOMER",
      title: `Order cancelled — #${order._id}`,
      message: `${product.title} (x${order.productDetails.order}) in order #${order._id} has been cancelled by the buyer.`,
      route: `/`,
      data: { orderId: order._id, productId: product._id }
    });

    res.json({ msg: "Order rejected successfully", order });
})
