const Seller = require("../models/SellerModel");
const Deliverer = require("../models/DelivererModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/ErrorHandler");
const { updateWeeklyActivity } = require("../utils/relatedFunc");
const { notifyUser } = require("../services/notificationService");

exports.getNeedToDeliverController = catchAsync(async (req, res) => {
  const delivererId = req.userId;

  // Get orders assigned to this deliverer
  const orders = await Order.find({ deliverer: delivererId })
    .populate("user", "name email")
    .populate("productDetails.product", "title price images")
    .sort({ createdAt: -1 });

  const now = new Date();

  const filteredOrders = orders.filter(order => {
    if (order.orderStatus === "Shipped") {
      return true;
    }
    if (order.orderStatus === "Delivered" && order.deliveredAt) {
      const daysSinceDelivered =
        (now - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
      return daysSinceDelivered <= 2;
    }
    return false;
  });

  res.status(200).json({
    success: true,
    count: filteredOrders.length,
    orders: filteredOrders
  });
});

exports.markOrderDeliverController = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const {status} = req.body;

  const order = await Order.findById(orderId).populate("deliverer").populate("productDetails.product","title seller price");
  if (!order) throw new ErrorHandler("Order Not Found", 404);

  if (order.deliverer?._id?.toString() !== req.userId) {
    throw new ErrorHandler("Not authorized to deliver this order", 401);
  }

  order.orderStatus = status;
  const deliverer = await Deliverer.findById(req.userId);

  // === PERFORMANCE METRICS ===
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    deliverer.performance.totalDeliveries += 1;
    deliverer.completedDeliveries += 1;

    const deliveryTimeMinutes = Math.round((order.deliveredAt - order.shippedAt) / (1000 * 60));
    const prevAvg = deliverer.performance.averageDeliveryTime;
    const prevCount = deliverer.performance.totalDeliveries;
    const num =((prevAvg * prevCount) + deliveryTimeMinutes) /(prevCount + 1);
    deliverer.performance.averageDeliveryTime = Math.ceil(num * 100) / 100;
    if (order.deliveredAt <= order.expectedDelivery) {
      deliverer.performance.onTimeDeliveries += 1;
    }
    if (order.paymentMethod === "COD" && order.paymentStatus === "Pending") {
      const codAmount = order.productDetails?.totalPrice || 0;
      order.paymentStatus = "Paid"; // or keep as Pending until settlement stage, depending on your flow
      if (codAmount > 0) {
        deliverer.codSummary.pendingAmount -= codAmount;

        // Check if collectedToday is for the same day
        const today = new Date().toDateString();
        const lastHistory = deliverer.codSummary.history[deliverer.codSummary.history.length - 1];

        if (!lastHistory || new Date(lastHistory.date).toDateString() !== today) {
          // New day, reset collectedToday
          deliverer.codSummary.collectedToday = codAmount;
        } else {
          deliverer.codSummary.collectedToday += codAmount;
        }
      }
    }

    updateWeeklyActivity(deliverer._id,"Deliverer","performance.weeklyDeliveries");

  } else if (status === "Failed") {
    deliverer.performance.failedDeliveries += 1;
  }

  // Recalculate completion rate
  deliverer.performance.completionRate = (
    (deliverer.performance.totalDeliveries /
    (deliverer.performance.totalDeliveries + deliverer.performance.failedDeliveries)) * 100
  ).toFixed(2);

  await order.save({ validateBeforeSave: false });
  await deliverer.save({ validateBeforeSave: false });

  if (status === "Delivered") {
    await notifyUser(order.user.toString(), {
      type: "ORDER_DELIVERED",
      title: `Order Delivered!..`,
      message: `Your order for "${order.productDetails?.product?.title}" has been delivered.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id, productId: order.productDetails?.product?._id }
    });
  }

  if (status === "Failed") {
    await notifyUser(order.user.toString(), {
      type: "DELIVERY_FAILED",
      title: "Delivery Attempt Failed",
      message: `We couldn't deliver "${order.productDetails?.product?.title}". Please check your order.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id }
    });
  }

  res.json({ message: "Order status updated & metrics recalculated" });
});

exports.getMetricesController = catchAsync(async(req,res) => {
  const deliverer = await Deliverer.findById(req.userId)
  res.json({success : true, deliverer});
})

exports.needToPickupReturnController = catchAsync(async (req, res) => {
  const delivererId = req.userId; // deliverer logged in
  const orders = await Order.find({
    deliverer: delivererId,
    orderStatus: "ReturnAccepted"
  })
    .populate("user", "name email")
    .populate("productDetails.product", "title images price");

  res.json({ msg: "Returns to be picked up", orders });
});

exports.returnPickUpController = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("productDetails.product","title seller price");

    if (!order) throw new ErrorHandler("Order not found",404);
    if (order.orderStatus !== "ReturnAccepted")
      throw new ErrorHandler("Invalid status for deliverer pickup",400);
    if (order.deliverer?._id?.toString() !== req.userId) {
      throw new ErrorHandler("Not authorized to pickUp this order", 401);
    }
    order.orderStatus = "ReturnPickedUp";
    order.returnPickedUpAt = new Date();
    await order.save({validateBeforeSave : false});
    await notifyUser(order.user.toString(), {
      type: "RETURN_PICKED",
      title: "Return Picked Up!..",
      message: `Your return for "${order.productDetails?.product?.title}" has been collected by the deliverer.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id }
    });

    // optional seller notification
    await notifyUser(order.productDetails?.product?.seller.toString(), {
      type: "REFUND_NEEDED",
      title: `Refund Needed for order- ${order._id}`,
      message: `A return pickedup for "${order.productDetails?.product?.title}"..Need to Refund..`,
      route: `/returns-refunds`,
      data: { orderId: order._id }
    });

    res.json({ msg: "Return item picked by deliverer", order });
})