const BaseUser = require('./BaseUserModel');
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  week: String, // Example: "Aug 12 - Aug 18"
  count: { type: Number, default: 0 }
}, { _id: false });
const amountDailySchema = new mongoose.Schema({
  date:{ type: Date},
  amount: { type: Number, default: 0 }
}, { _id: false });


const DelivererSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['Bike', 'Scooter', 'Car', 'Van', 'Other'],
    required: true
  },
  licenseNumber: { type: String, required: true },

  serviceAreas: [{
    city: String,
    pincode: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],

  availability: { type: Boolean },

  workingHours: {
    startTime: { type: String, default: '' }, // e.g., "09:00"
    endTime: { type: String, default: '' },     // e.g., "18:00"
    workingDays: [{
    type: String,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ]
    }]
  },

  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  returnPickups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

  // COD Summary
  codSummary: {
    pendingAmount: { type: Number, default: 0 }, // COD yet to be submitted
    collectedToday: { type: Number, default: 0 }, // For today's settlements
    history: {type : [amountDailySchema], default:[]},
  },

  // Performance metrics for dashboard
  performance: {
    totalDeliveries: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 }, // in minutes
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // %
    weeklyDeliveries: { type: [activitySchema], default: [] },
    weeklyPickups : { type: [activitySchema], default: [] },
  },

  // Notifications
  notifications: [{
    message: String,
    type: { type: String, enum: ['Order', 'Payment', 'System', 'Alert'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  completedDeliveries: { type: Number, default: 0 },

  joinedAt: { type: Date, default: Date.now }
});


DelivererSchema.pre('remove', async function(next) {
  try {
    // unassign any orders
    const Order = mongoose.model('Order');
    await Order.updateMany({ deliverer: this._id }, { $unset: { deliverer: "" }, $set: { delivererUnassigned: true } });
    next();
  } catch (err) { next(err); }
});

DelivererSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  try {
    const Order = mongoose.model('Order');
    await Order.updateMany({ deliverer: doc._id }, { $unset: { deliverer: "" }, $set: { delivererUnassigned: true } });
  } catch (e) { console.error(e); }
});

module.exports = BaseUser.discriminator('Deliverer',DelivererSchema);