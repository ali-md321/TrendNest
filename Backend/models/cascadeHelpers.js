const mongoose = require('mongoose');
const { deleteImageFromBucket } = require('../config/googleCloudConfig');

// delete images in small batches to avoid overloading GCS
async function deleteImagesSafely(urls = [], concurrency = 5) {
  if (!Array.isArray(urls) || urls.length === 0) return;
  // filter falsy, dedupe
  const unique = Array.from(new Set(urls.filter(Boolean)));
  for (let i = 0; i < unique.length; i += concurrency) {
    const chunk = unique.slice(i, i + concurrency);
    // run deletes in parallel for the chunk, but await each chunk
    await Promise.all(chunk.map(async (url) => {
      try {
        await deleteImageFromBucket(url);
      } catch (err) {
        console.error('[deleteImagesSafely] error deleting', url, err?.message || err);
      }
    }));
  }
}

async function recalcProductAggregates(productId, session = null) {
  const Review = mongoose.model('ReviewRating');
  const Product = mongoose.model('Product');
  // aggregate to compute avg and count
  const agg = await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]).session ? await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]) : []; // defensive for older mongoose; but .session will be applied on calls below if session
  if (agg && agg.length) {
    const { avgRating, count } = agg[0];
    if (Product.schema.path('ratings') || Product.schema.path('numOfReviews')) {
      await Product.findByIdAndUpdate(productId,
        { 
          ...(Product.schema.path('ratings') ? { ratings: avgRating } : {}),
          ...(Product.schema.path('numOfReviews') ? { numOfReviews: count } : {})
        },
        { session }
      );
    }
  } else {
    if (Product.schema.path('ratings') || Product.schema.path('numOfReviews')) {
      await Product.findByIdAndUpdate(productId,
        { ...(Product.schema.path('ratings') ? { ratings: 0 } : {}), ...(Product.schema.path('numOfReviews') ? { numOfReviews: 0 } : {}) },
        { session }
      );
    }
  }
}

async function recalcSellerAggregatesBySellerId(sellerId, session = null) {
  // recompute seller-level rating by aggregating across reviews for seller's products
  const Review = mongoose.model('ReviewRating');
  const Seller = mongoose.model('Seller');

  const agg = await Review.aggregate([
    { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $match: { 'product.seller': mongoose.Types.ObjectId(sellerId) } },
    { $group: { _id: '$product.seller', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]).session ? await Review.aggregate([
    { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $match: { 'product.seller': mongoose.Types.ObjectId(sellerId) } },
    { $group: { _id: '$product.seller', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]) : [];

  if (agg && agg.length) {
    const { avgRating, count } = agg[0];
    if (Seller.schema.path('avgRating') || Seller.schema.path('totalReviews')) {
      await Seller.findByIdAndUpdate(sellerId, {
        ...(Seller.schema.path('avgRating') ? { avgRating: avgRating } : {}),
        ...(Seller.schema.path('totalReviews') ? { totalReviews: count } : {})
      }, { session });
    }
  } else {
    if (Seller.schema.path('avgRating') || Seller.schema.path('totalReviews')) {
      await Seller.findByIdAndUpdate(sellerId, {
        ...(Seller.schema.path('avgRating') ? { avgRating: 0 } : {}),
        ...(Seller.schema.path('totalReviews') ? { totalReviews: 0 } : {})
      }, { session });
    }
  }
}

async function deleteReviewCascade(reviewIdOrDoc, session = null) {
  const Review = mongoose.model('ReviewRating');
  const Product = mongoose.model('Product');
  const Customer = mongoose.model('Customer'); // discriminator with reviewRatings
  const Order = mongoose.model('Order');

  // normalize doc and id
  let reviewDoc;
  let reviewId;

  if (reviewIdOrDoc && reviewIdOrDoc._id) {
    reviewDoc = reviewIdOrDoc;
    reviewId = reviewDoc._id;
  } else {
    reviewId = reviewIdOrDoc;
    const query = Review.findById(reviewId);
    if (session) query.session(session);
    reviewDoc = await query;
  }

  if (!reviewDoc) return;

  const productId = reviewDoc.product;
  const customerId = reviewDoc.user; // user here is actually the Customer
  const orderId = reviewDoc.order;

  // collect images from review
  const images = Array.isArray(reviewDoc.images)
    ? reviewDoc.images
    : reviewDoc.image
      ? [reviewDoc.image]
      : [];

  // 1) remove review id from product.reviews
  if (productId) {
    await Product.updateOne(
      { _id: productId },
      { $pull: { reviews: reviewDoc._id } },
      { session }
    ).catch(console.error);
  }

  // 2) remove review id from customer's reviewRatings
  if (customerId) {
    await Customer.updateOne(
      { _id: customerId },
      { $pull: { reviewRatings: reviewDoc._id } },
      { session }
    ).catch(console.error);
  }

  // 3) unset review field on order
  if (orderId) {
    await Order.updateOne(
      { _id: orderId, review: reviewDoc._id },
      { $unset: { review: "" } },
      { session }
    ).catch(console.error);
  }

  // 4) delete review document
  await Review.deleteOne({ _id: reviewDoc._id }, { session }).catch(console.error);

  // 5) recalc product aggregates
  try {
    const agg = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (agg && agg.length) {
      await Product.findByIdAndUpdate(
        productId,
        { ratings: agg[0].avgRating, numOfReviews: agg[0].count },
        { session }
      ).catch(() => {});
    } else {
      await Product.findByIdAndUpdate(
        productId,
        { ratings: 0, numOfReviews: 0 },
        { session }
      ).catch(() => {});
    }
  } catch (e) {
    console.error('[deleteReviewCascade] recalc failed', e);
  }

  // 6) delete review images from GCS
  if (images.length) {
    for (const imgUrl of images) {
      try {
        await deleteImageFromBucket(imgUrl);
      } catch (err) {
        console.error(`Failed to delete review image: ${imgUrl}`, err.message);
      }
    }
  }
}

async function deleteProductCascade(productIdOrDoc, session = null) {
  const Review = mongoose.model('ReviewRating');
  const Customer = mongoose.model('Customer');
  const Order = mongoose.model('Order');
  const Product = mongoose.model('Product');

  let productDoc = null;
  let productId;

  if (productIdOrDoc && productIdOrDoc._id) {
    productDoc = productIdOrDoc;
    productId = productDoc._id;
  } else {
    productId = productIdOrDoc;
    productDoc = session
      ? await Product.findById(productId).session(session)
      : await Product.findById(productId);
  }
  if (!productDoc) return;

  // Get related reviews
  const reviews = session
    ? await Review.find({ product: productId }).select('_id images').session(session)
    : await Review.find({ product: productId }).select('_id images');

  const reviewIds = reviews.map(r => r._id);
  const reviewImages = reviews.reduce((acc, r) => {
    if (Array.isArray(r.images)) acc.push(...r.images);
    else if (r.image) acc.push(r.image);
    return acc;
  }, []);

  // Remove review refs from customers
  if (reviewIds.length) {
    await Customer.updateMany(
      { reviewRatings: { $in: reviewIds } },
      { $pull: { reviewRatings: { $in: reviewIds } } },
      { session }
    ).catch(console.error);

    // Delete review docs
    await Review.deleteMany({ _id: { $in: reviewIds } }, { session }).catch(console.error);
  }

  // Remove product refs from users
  await Customer.updateMany({ addedProducts: productId }, { $pull: { addedProducts: productId } }, { session });
  await Customer.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } }, { session });
  await Customer.updateMany({ savedForLater: productId }, { $pull: { savedForLater: productId } }, { session });
  await Customer.updateMany({ 'cart.product': productId }, { $pull: { cart: { product: productId } } }, { session });

  // Update orders with snapshot
  const snapshot = {
    name: productDoc.name,
    price: productDoc.price,
    images: productDoc.images || [],
    category: productDoc.category ? String(productDoc.category) : null,
    seller : productDoc.seller
  };

  // Update orders: mark deleted, store snapshot, and remove the ref
    await Order.updateMany(
    { 'productDetails.product': productId },
    {
        $set: {
        'productDetails.productDeleted': true,
        'productDetails.deletedProductSnapshot': snapshot
        },
        $unset: { 'productDetails.product': "" } // removes ObjectId reference
    },
    { session }
    ).catch(console.error);

  // Delete product + review images from GCS
  const productImages = Array.isArray(productDoc.images) ? productDoc.images : (productDoc.image ? [productDoc.image] : []);
  const allImages = Array.from(new Set([...(productImages || []), ...(reviewImages || [])]));

  if (allImages.length) {
    await deleteImagesSafely(allImages, 5);
  }

  // Delete product doc
  await Product.deleteOne({ _id: productId }, { session }).catch(console.error);
}


/**
 * deleteCustomerCascade(customerId, session)
 * - delete customer's reviews (and recalc aggregates via deleteReviewCascade)
 * - delete or anonymize orders (two approaches described)
 * - remove any other references (tickets, etc.)
 */
async function deleteCustomerCascade(customerId, { session = null, hardDeleteOrders = true } = {}) {
  const Review = mongoose.model('ReviewRating');
  const Order = mongoose.model('Order');
  const User = mongoose.model('User');

  // 1) delete all reviews by customer
  const reviews = await Review.find({ user: customerId }).select('_id product').session ? await Review.find({ user: customerId }).session(session) : await Review.find({ user: customerId });
  for (const r of reviews) {
    await deleteReviewCascade(r._id, session);
  }

  // 2) handle orders: either hard-delete them OR anonymize them
  if (hardDeleteOrders) {
    // delete linked order reviews (if any) and delete orders
    const orders = await Order.find({ user: customerId }).session ? await Order.find({ user: customerId }).session(session) : await Order.find({ user: customerId });
    for (const o of orders) {
      if (o.review) await deleteReviewCascade(o.review, session);
    }
    await Order.deleteMany({ user: customerId }).session ? await Order.deleteMany({ user: customerId }).session(session) : await Order.deleteMany({ user: customerId });
  } else {
    // anonymize
    await Order.updateMany({ user: customerId }, { $set: { user: null, userDeleted: true } }, { session });
  }

  // 3) finally remove references inside User collection: wishlist/cart are embedded in the deleted user doc, so nothing to do
}

/**
 * deleteSellerCascade(sellerId, session)
 * - delete all products by the seller (product cascade will run)
 * - clean up promotions/other references (if any)
 */
async function deleteSellerCascade(sellerId, session = null) {
  const Product = mongoose.model('Product');
  // delete products (this will trigger product cascade if you hook product middleware)
  await Product.deleteMany({ seller: sellerId }).session ? await Product.deleteMany({ seller: sellerId }).session(session) : await Product.deleteMany({ seller: sellerId });

  // Optionally recalc or delete other seller-specific artifacts
}

/**
 * deleteOrderCascade(orderId, session)
 * - remove order from customer.orders array
 * - delete linked review
 * - if deliverer exists, remove reference from deliverer assigned orders
 */
async function deleteOrderCascade(orderId, session = null) {
  const Order = mongoose.model('Order');
  const User = mongoose.model('User');
  const Review = mongoose.model('ReviewRating');
  const Deliverer = mongoose.model('Deliverer');

  const order = await Order.findById(orderId).session ? await Order.findById(orderId).session(session) : await Order.findById(orderId);
  if (!order) return;

  // remove from customer's orders array
  if (order.user) await User.updateOne({ _id: order.user }, { $pull: { orders: orderId } }, { session });

  // delete linked review
  if (order.review) await deleteReviewCascade(order.review, session);

  // unassign deliverer
  if (order.deliverer) {
    await Deliverer.findByIdAndUpdate(order.deliverer, { $pull: { assignedOrders: orderId } }, { session });
  }
}

module.exports = {
  deleteImagesSafely,
  deleteProductCascade,
  deleteReviewCascade,
  deleteCustomerCascade,
  deleteSellerCascade,
  deleteOrderCascade,
  recalcProductAggregates,
  recalcSellerAggregatesBySellerId
};
