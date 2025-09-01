// Backend/config/cronJobs.js
const cron = require("node-cron");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Customer = require("../models/CustomerModel");
const Seller = require("../models/SellerModel");
const Deliverer = require("../models/DelivererModel");
const { notifyUser } = require("../services/notificationService");

// 🕒 1. Order Reminder (Customers) - daily
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Running Order Reminder cron...");

  const orders = await Order.find({
    orderStatus: "Shipped",
    updatedAt: { $lt: new Date(Date.now() - 10 * 60 * 60 * 1000) }, 
  }).populate("productDetails.product","title seller");

  for (const order of orders) {
    await notifyUser(order.user.toString(), {
      type: "ORDER_REMINDER",
      title: "Order Out for Delivery",
      message: `Your order "${order.productDetails?.product?.title}" is still out for delivery. Please be available to receive it.`,
      route: `/order-details/${order._id}`,
      data: { orderId: order._id },
    });
  }
});

// 🕒 2. Pending Review Nudges (Customers) - every 3 days
cron.schedule("0 10 */3 * *", async () => {
  console.log("⏰ Running Review Nudge cron...");

  const orders = await Order.find({
    orderStatus: "Delivered",
    updatedAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    review: { $ne: true },
  });

  for (const order of orders) {
    await notifyUser(order.user.toString(), {
      type: "REVIEW_REMINDER",
      title: "Share Your Experience",
      message: `You received "${order.productDetails?.product?.title}". Please leave a review.`,
      route: `/order/${order._id}/review`,
      data: { orderId: order._id },
    });
  }
});

// 🕒 3. Low Stock Warning (Sellers) - every 2 days
cron.schedule("0 8 */2 * *", async () => {
  console.log("⏰ Running Low Stock Warning cron...");

  const products = await Product.find({ stock: { $lt: 10 } }).populate("seller");

  for (const product of products) {
    if (product.seller) {
      await notifyUser(product.seller._id, {
        type: "LOW_STOCK_ALERT",
        title: "Low Stock Alert",
        message: `"${product.title}" stock is running low (only ${product.stock} left). Restock soon!`,
        route: `/product/${product._id}`,
        data: { productId: product._id },
      });
    }
  }
});

// 🕒 4. Pending Orders Reminder (Sellers) - every morning
cron.schedule("0 7 * * *", async () => {
  console.log("⏰ Running Pending Orders Reminder cron...");

  const orders = await Order.find({
    status: "Confirmed",
    updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // >24h
  }).populate("productDetails.product","title seller price");

  for (const order of orders) {
    if (order.seller) {
      await notifyUser(order.seller.toString(), {
        type: "PENDING_ORDER_SHIPMENT",
        title: "Pending Order to Ship",
        message: `Order "${order._id}" for "${order.productDetails?.product?.title}" is still pending shipment.`,
        route: `/shipment`,
        data: { orderId: order._id },
      });
    }
  }
});

// 🕒 5. Return Deliver Reminders (Deliverers) - every morning
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running Return Pickup Reminder cron...");

  const orders = await Order.find({
    status: "ReturnAccepted",
  }).populate("productDetails.product","title seller price");

  for (const order of orders) {
    if (order.deliverer) {
      await notifyUser(order.deliverer.toString(), {
        type: "RETURN_PICKUP_REMINDER",
        title: "Return Pickup Pending",
        message: `You have a pending return pickup for "${order.productDetails?.product?.title}".`,
        route: `/deliverer/return-pickups`,
        data: { orderId: order._id },
      });
    }
  }
});

