const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected...");
    require("../jobs/sellerActivitysSheduler");
    require('../jobs/delivererActivityScheduler');
    require("../jobs/notifyCornJobs")
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

module.exports = connectDB;