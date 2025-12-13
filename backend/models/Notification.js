const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["CRITICAL_ISSUE", "STATUS_CHANGE", "NEW_JOB", "BILL_CREATED"],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        jobCardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobCard"
        },
        read: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM"
        }
    },
    { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
