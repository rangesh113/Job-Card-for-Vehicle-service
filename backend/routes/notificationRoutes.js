const express = require("express");
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Get user notifications
router.get("/", getNotifications);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all as read
router.put("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
