const Notification = require("../models/Notification");
const User = require("../models/User");

// Create notification
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, jobCardId, priority } = req.body;

        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            jobCardId,
            priority: priority || "MEDIUM"
        });

        // Emit socket event (will be handled by socket.io)
        if (req.io) {
            req.io.to(userId.toString()).emit("notification", notification);
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { unreadOnly } = req.query;

        const query = { userId: req.user.id };
        if (unreadOnly === "true") {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate("jobCardId", "vehicleNumber customerName status")
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            read: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to send notification
exports.sendNotification = async (userId, type, title, message, jobCardId, priority = "MEDIUM", io = null) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            jobCardId,
            priority
        });

        // Emit socket event if io is available
        if (io) {
            io.to(userId.toString()).emit("notification", notification);
        }

        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
        return null;
    }
};
