const Deliverer = require("../models/DelivererModel");
const Seller = require("../models/SellerModel");
const ErrorHandler = require("./ErrorHandler");


function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
exports.assignDeliveries = async (order) => {
  const { lat, lng } = order.address;  // must be populated from pincode lookup

  const deliverers = await Deliverer.find({
    serviceAreas: { $elemMatch: { pincode: order.address.pincode } }
  });

  const assign = async (deliverer) => {
    deliverer.assignedOrders.push(order._id);
    if (order.paymentMethod === "COD") {
      deliverer.codSummary.pendingAmount += order.totalAmount;
    }
    await deliverer.save({ validateBeforeSave: false });

    order.deliverer = deliverer._id;
    await order.save({ validateBeforeSave: false });

    return deliverer;
  };

  if (deliverers.length) {
    return await assign(deliverers[0]); // exact pincode match
  }

  // nearest by lat/lng
  const allDeliverers = await Deliverer.find({ "serviceAreas.lat": { $exists: true } });

  if (!allDeliverers.length) {
    throw new ErrorHandler("No deliverers available for assignment", 404);
  }

  let nearest = null;
  let minDist = Infinity;

  allDeliverers.forEach(del => {
    del.serviceAreas.forEach(area => {
      const dist = getDistance(lat, lng, area.lat, area.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = del;
      }
    });
  });

  if (nearest) {
    return await assign(nearest);
  }

  return null;
};


exports.getWeekLabel = (date = new Date()) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday

  const format = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${format(start)} - ${format(end)}`;
}

exports.updateWeeklyActivity = async (userId, role, fieldPath) => {
  let Model;
  if (role === "Seller") {
    Model = Seller;
  } else if (role === "Deliverer") {
    Model = Deliverer;
  } else {
    throw new ErrorHandler("Specify role!..", 500);
  }

  const user = await Model.findById(userId);
  if (!user) throw new ErrorHandler("User not found", 404);

  const getNestedField = (obj, path) => path.split('.').reduce((acc, part) => acc?.[part], obj);

  const setNestedField = (obj, path, value) => {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc[part] ?? (acc[part] = {}), obj);
    target[last] = value;
  };

  const weekLabel = this.getWeekLabel();
  let activityArray = getNestedField(user, fieldPath);

  if (!Array.isArray(activityArray)) {
    activityArray = [];
    setNestedField(user, fieldPath, activityArray);
  }

  let existingWeek = activityArray.find(w => w.week === weekLabel);
  if (existingWeek) {
    existingWeek.count += 1;
  } else {
    activityArray.push({ week: weekLabel, count: 1 });
    if (activityArray.length > 7) {
      activityArray.splice(0, activityArray.length - 7);
    }
  }

  await user.save({ validateBeforeSave: false });
};
