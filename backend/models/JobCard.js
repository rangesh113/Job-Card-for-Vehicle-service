const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema(
  {
    customerName: String,
    customerPhone: String,

    vehicleType: {
      type: String,
      enum: ["2-wheeler", "4-wheeler"],
      required: true
    },

    vehicleModel: {
      type: String,
      required: true
    },

    vehicleNumber: {
      type: String,
      required: true
    },

    complaint: String,

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "DONE"],
      default: "NEW"
    },

    // NEW: Critical issue tracking
    isCritical: {
      type: Boolean,
      default: false
    },

    criticalReason: String,

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM"
    },

    // NEW: Status history for timeline
    statusHistory: [{
      status: String,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      notes: String
    }],

    // NEW: Time tracking
    startedAt: Date,
    completedAt: Date,
    estimatedDuration: Number, // in hours
    actualDuration: Number,    // in hours

    // NEW: Photo documentation
    photos: [{
      url: String,
      filename: String,
      caption: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ["BEFORE", "DURING", "AFTER", "ISSUE"]
      }
    }],

    serviceNotes: String,
    recommendations: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Index for search functionality
jobCardSchema.index({
  customerName: 'text',
  vehicleNumber: 'text',
  vehicleModel: 'text'
});

module.exports = mongoose.model("JobCard", jobCardSchema);
