const Seller = require("../models/SellerModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { uploadImageToBucket, deleteImageFromBucket } = require("../config/googleCloudConfig");
const catchAsync = require("../middlewares/catchAsync");
const ReviewRating = require("../models/reviewRatingModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { assignDeliveries, updateWeeklyActivity } = require("../utils/relatedFunc");
const { notifyUser } = require("../services/notificationService");

exports.addProductController = catchAsync(async (req, res) => {
  const {title,description,highlights,brand,category,price,discountedPrice,stock} = req.body;
  const userId = req.userId;
  if (!req.files || req.files.length === 0) {
    throw new ErrorHandler('At least one image is required', 400);
  }
  const uploadedImageUrls = [];
  for (const file of req.files) {
    const url = await uploadImageToBucket(file.buffer, `products/${Date.now()}_${file.originalname}`, file.mimetype);
    uploadedImageUrls.push(url);
  }
  const product = await Product.create({
    title,
    description,
    highlights: highlights ? JSON.parse(highlights) : [],
    brand,
    category,
    price,
    discountedPrice,
    discountPercent: price && discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0,
    stock,
    images: uploadedImageUrls,
    seller: req.userId
  });
  let user = await Seller.findById(userId);
  user.addedProducts.push(product);
  await user.save({ validateBeforeSave: false });
  await updateWeeklyActivity(userId,"Seller", 'productActivity');
  
  await notifyUser(userId, {
    type: "PRODUCT_ADDED",
    title: "Product added to your store",
    message: `"${product.title}" is live in your catalog.Try to add More Products..`,
    route: `/product/${product._id}`,
    data: { productId: product._id, productImage: product.images?.[0] || null }
  });
  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    sellerProduct : product,
  });
});

exports.showSellerProductsController = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const base = await Seller.findById(req.userId).select("addedProducts");
  if (!base) throw new ErrorHandler("Seller not found", 404);

  const total = base.addedProducts?.length || 0;

  await base.populate({
    path: "addedProducts",
    options: { sort: { _id: -1 }, skip, limit },
  });
  const products = base.addedProducts || [];
  res.json({
    message: "Seller Products Fetched!..",
    sellerProducts: products,
    hasMore: skip + products.length < total,
  });
});

exports.getSellerProductController = catchAsync(async (req, res) => {
  const {productId} = req.params;
  const product = await Product.findById(productId).lean();

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const reviews = await ReviewRating.find({ product: productId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  product.reviews = reviews;
  res.json({
    success: true,
    message: 'Seller Product Fetched!',
    sellerProduct: product
  });
});

exports.editSellerProductController = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const {title,description,highlights,brand,category,price,discountedPrice,stock,images} = req.body;
  const userId = req.userId;
  let priceDrop = false,stockChange = false;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }
  if (product.seller.toString() !== userId) {
    throw new ErrorHandler('Unauthorized to edit this product', 403);
  }
  if (!images && (!req.files || req.files.length === 0)) {
    throw new ErrorHandler('At least one image is required', 400);
  }

  const uploadedImageUrls = [];
  for (const oldUrl of product.images) {
    if(images && images.includes(oldUrl)){
      uploadedImageUrls.push(oldUrl);
    }else{
      await deleteImageFromBucket(oldUrl);
    }
  }
  for (const file of req.files) {
    const url = await uploadImageToBucket(
      file.buffer,
      `products/${Date.now()}_${file.originalname}`,
      file.mimetype
    );
    uploadedImageUrls.push(url);
  }
  let type,notiTitle,message;
  if(product.discountedPrice > discountedPrice){
    priceDrop = true;
    type = "PRICE_DROPPED";
    notiTitle = `${product.title} price Dropped!..`;
    message = `"${product.title}"drops price..Buy Now..`;
  }
  if (product.stock === 0 && stock > 0) {
      type = "BACK_IN_STOCK",
      notiTitle = `Back in stock for product ${product.title}`,
      message = `"${product.title}" is available again. Hurry before it sells out!`;
  }

  product.title = title;
  product.description = description;
  product.highlights = highlights ? JSON.parse(highlights) : [];
  product.brand = brand;
  product.category = category;
  product.price = price;
  product.discountedPrice = discountedPrice;
  product.discountPercent = price && discountedPrice
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;
  product.stock = stock;
  product.images = uploadedImageUrls;

  await product.save();
  if(priceDrop || stockChange){
    const users = await Customer.find({ wishlist: productId }).select("_id");
    for(const user of users){
      await notifyUser(user._id, {
        type,
        title: notiTitle,
        message,
        route: `/product/${product._id}`,
        data: { productId: product._id, productImage: product.images?.[0] || null }
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    sellerProduct : product,
  });
});

exports.deleteSellerProductController = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }
  if (product.seller.toString() !== userId) {
    throw new ErrorHandler('Unauthorized to delete this product', 403);
  }

  for (const url of product.images) {
    await deleteImageFromBucket(url);
  }

  await Product.findByIdAndDelete(productId);
  // await Seller.findByIdAndUpdate(userId, {
  //   $pull: { addedProducts: productId },
  // });

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

exports.getNeedToShipController = catchAsync(async (req, res) => {
  const sellerId = req.userId; // current logged-in seller

  const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
  const sellerProductIds = sellerProducts.map(p => p._id);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const orders = await Order.find({
    "productDetails.product": { $in: sellerProductIds },
    $or: [
      { orderStatus: {$in : ["Shipped","Placed","Confirmed"]} },
      { 
        orderStatus: "Delivered",
        deliveredAt: { $gte: twoDaysAgo }
      }
    ]
  })
    .populate({
      path: "productDetails.product",
      select: "title price images seller"
    })
    .populate("user", "name email")
    .populate("deliverer","name email");

  res.status(200).json({
    status: "success",
    count: orders.length,
    orders
  });
});

exports.updateShipmentController = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("productDetails.product","seller title price");
  if (!order) {
    throw new ErrorHandler("Order Not Found", 404);
  }

  const product = await Product.findById(order?.productDetails?.product);
  if (!product) {
    throw new ErrorHandler("Product Not Found", 404);
  }

  const quantityOrdered = order?.productDetails?.quantity || 1;
  if (product.stock < quantityOrdered) {
    throw new ErrorHandler("Insufficient Stock", 400);
  }
  product.stock -= quantityOrdered;
  await product.save({ validateBeforeSave: false });

  order.orderStatus = "Shipped";
  order.shippedAt = Date.now();
  await order.save({ validateBeforeSave: false });

  const assignedDeliverer = await assignDeliveries(order);
  await notifyUser(order.user.toString(), {
    type: "ORDER_SHIPPED",
    title: `Your Order of  ${product.title} shipped`,
    message: `${product.title} has been shipped. Track delivery for updates.`,
    route: `/order-details/${order._id}`,
    data: { orderId: order._id }
  });

  if (assignedDeliverer) {
    const delivererId = assignedDeliverer._id ? assignedDeliverer._id.toString() : assignedDeliverer;
    await notifyUser(delivererId, {
      type: "DELIVERY_ASSIGNED",
      title: `Delivery assigned — ${order._id}`,
      message: `Pickup: Please pickup & deliver order #${order._id}.`,
      route: `/orders/assigned`,
      data: { orderId: order._id, address: order.shippingAddress || order.address || null }
    });
  }
  res.status(200).json({
    success: true,
    message: "Order marked as shipped and stock updated successfully",
    order,
  });
});

exports.getMetricesController = catchAsync(async(req,res) => {
  const seller = await Seller.findById(req.userId)
  res.json({success : true, seller});
})

exports.needToAcceptReturnController = catchAsync(async (req, res) => {
  const sellerId = req.userId;

  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ErrorHandler("Seller not found", 404);

  const orders = await Order.find({
    orderStatus: "ReturnRequest",
    $or: [
      { "productDetails.product": { $in: seller.addedProducts } },
      { "productDetails.deletedProductSnapshot.seller": sellerId }
    ]
  })
    .populate("user", "name email")
    .populate("productDetails.product", "title images price");

  res.json({ msg: "Returns needing acceptance", orders });
});

exports.returnAcceptController = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("productDetails.product","seller title price");

    if (!order) throw new ErrorHandler("Order not found",404);
    if (order.productDetails.product.seller?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to accept return of this order", 401);
    }

    if (order.orderStatus !== "ReturnRequest")
      throw new ErrorHandler("Invalid status for Return acceptance",400);

    order.orderStatus = "ReturnAccepted";
    order.returnAcceptedAt = new Date();
    await order.save({validateBeforeSave : false});

    await notifyUser(order.user.toString(), {
      type: "RETURN_ACCEPTED",
      title: `Return accepted — Order of ${order.productDetails?.product.title}`,
      message: `${order.productDetails?.product?.title || "Item"} return accepted by seller. A deliverer will be assigned for pickup.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id }
    });
    res.json({ message: "Return accepted, waiting for deliverer pickup", order });

})

exports.needToRefundController = catchAsync(async (req, res) => {
  const sellerId = req.userId;

  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ErrorHandler("Seller not found", 404);

  const orders = await Order.find({
    orderStatus: "ReturnPickedUp",
    $or: [
      { "productDetails.product": { $in: seller.addedProducts } },
      { "productDetails.deletedProductSnapshot.seller": sellerId }
    ]
  })
    .populate("user", "name email")
    .populate("productDetails.product", "title images price");

  res.json({ msg: "Returns needing refund", orders });
});

exports.refundOrderController = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("productDetails.product","seller title price");

    if (!order)  throw new ErrorHandler("Order not found",404);
    if (order.productDetails.product.seller?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to refund this order", 401);
    }
    if (order.orderStatus !== "ReturnPickedUp")
       throw new ErrorHandler("Invalid status for refund",400);

    order.orderStatus = "Refunded";
    order.refundedAt = new Date();
    await order.save({validateBeforeSave : false});

    const refundAmount = order.totalAmount;
    await notifyUser(order.user.toString(), {
      type: "REFUND_PROCESSED",
      title: `Refund processed — Order of ${order.productDetails?.product?.title}`,
      message: `A refund ${refundAmount}has been processed for ${order.productDetails?.product?.title || 'your item'}.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id, amount: refundAmount }
    });
    res.json({ msg: "Order refunded successfully", order });
})

exports.rejectOrderController = catchAsync(async(req,res) => {
  const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("productDetails.product","seller title price");

    if (!order)  throw new ErrorHandler("Order not found",404);
    if (order.productDetails.product.seller?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to reject this order", 401);
    }
    if (!["ReturnRequest","ReturnPickedUp","Placed","Confirmed"].includes(order.orderStatus))
       throw new ErrorHandler("Invalid status for rejection",400);

    order.orderStatus = "Rejected";
    order.rejectedAt = new Date();
    await order.save({validateBeforeSave : false});

    await notifyUser(order.user.toString(), {
      type: "ORDER_REJECTED",
      title: `Order of ${order.productDetails?.product.title} rejected by seller`,
      message: `${order.productDetails?.product?.title || 'Item'} in your order has been rejected by the seller. Please check order details for next steps.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id }
    });

    res.json({ msg: "Order rejected successfully", order });
})
