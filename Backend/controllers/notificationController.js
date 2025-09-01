const catchAsync = require("../middlewares/catchAsync");
const Notification = require("../models/NotificationModel");

exports.getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ user: userId })
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
})

exports.getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.userId;
  const count = await Notification.countDocuments({ user: userId, readAt: null });
  res.json({ count });
})

exports.markRead = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  await Notification.updateOne({ _id: id, user: userId, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ success: true });
})

exports.markAllRead = catchAsync(async (req, res) => {
  const userId = req.userId;
  await Notification.updateMany({ user: userId, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ success: true });
})

exports.deleteNotiController = catchAsync(async(req,res) =>{
  const {notiId} = req.params;
  await Notification.findByIdAndDelete(notiId);
  res.json({
    message : "Notification Deleted!..",
  })
})

exports.deleteSelectNotiController = catchAsync(async(req,res) =>{
  const {delNotifications} = req.body;

  for(const notiId of delNotifications){
    await Notification.findByIdAndDelete(notiId);
  }

  res.json({
    message : "Selected Notifications Deleted!.."
  })
})
