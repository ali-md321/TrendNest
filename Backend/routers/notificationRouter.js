const router = require("express").Router();
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { getMyNotifications, getUnreadCount, markRead, markAllRead, deleteNotiController,deleteSelectNotiController} = require("../controllers/notificationController");

router.route("/notifications")
    .get(isAuthenticated, getMyNotifications )
    .delete(isAuthenticated, deleteSelectNotiController);
    
router.get("/notifications/unread-count", isAuthenticated, getUnreadCount);
router.post("/notifications/:id/read", isAuthenticated, markRead);
router.post("/notifications/read-all", isAuthenticated, markAllRead);
router.delete("/notifications/:notiId", isAuthenticated, deleteNotiController);

module.exports = router;
