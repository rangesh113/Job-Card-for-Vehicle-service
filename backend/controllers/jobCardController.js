const JobCard = require("../models/JobCard");
const { sendNotification } = require("./notificationController");

// CREATE JOB CARD (Service Advisor)
exports.createJobCard = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      complaint,
      technician,
      priority,
      estimatedDuration
    } = req.body;

    const job = await JobCard.create({
      customerName,
      customerPhone,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      complaint,
      technician,
      priority: priority || "MEDIUM",
      estimatedDuration,
      createdBy: req.user.id,
      statusHistory: [{
        status: "NEW",
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: "Job card created"
      }]
    });

    // Send notification to technician
    if (technician && req.io) {
      await sendNotification(
        technician,
        "NEW_JOB",
        "New Job Assigned",
        `New job card for ${vehicleNumber} - ${vehicleModel}`,
        job._id,
        priority || "MEDIUM",
        req.io
      );
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL JOB CARDS WITH SEARCH AND FILTER
exports.getAllJobCards = async (req, res) => {
  try {
    const {
      search,
      status,
      vehicleType,
      technician,
      startDate,
      endDate,
      priority,
      isCritical
    } = req.query;

    // Build query
    let query = {};

    // Text search
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
        { vehicleModel: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Vehicle type filter
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    // Technician filter
    if (technician) {
      query.technician = technician;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Critical filter
    if (isCritical === "true") {
      query.isCritical = true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const jobCards = await JobCard.find(query)
      .populate("technician", "name role")
      .populate("createdBy", "name role")
      .populate("statusHistory.changedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(jobCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET JOB CARDS FOR LOGGED-IN TECHNICIAN
exports.getMyJobCards = async (req, res) => {
  try {
    const jobCards = await JobCard.find({
      technician: req.user.id
    })
      .populate("createdBy", "name")
      .populate("statusHistory.changedBy", "name role")
      .sort({ priority: -1, createdAt: -1 });

    res.json(jobCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD SERVICE SUMMARY (Technician)
exports.addServiceSummary = async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job card not found" });
    }

    if (job.technician?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    job.serviceNotes = req.body.serviceNotes || "";
    job.recommendations = req.body.recommendations || "";

    // Don't auto-complete, let technician mark as done separately
    if (req.body.markAsDone) {
      job.status = "DONE";
      job.completedAt = new Date();

      // Calculate actual duration
      if (job.startedAt) {
        const duration = (new Date() - job.startedAt) / (1000 * 60 * 60); // hours
        job.actualDuration = Math.round(duration * 10) / 10;
      }

      // Add to history
      job.statusHistory.push({
        status: "DONE",
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: "Service completed with summary"
      });

      // Notify service advisor
      if (req.io && job.createdBy) {
        await sendNotification(
          job.createdBy,
          "STATUS_CHANGE",
          "Job Completed",
          `${job.vehicleNumber} - ${job.vehicleModel} service completed`,
          job._id,
          "MEDIUM",
          req.io
        );
      }
    }

    await job.save();
    res.json(job);
  } catch (error) {
    console.error("Add Summary Error:", error);
    res.status(500).json({ message: "Failed to add service summary" });
  }
};

// UPDATE JOB STATUS
exports.updateJobStatus = async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id).populate("createdBy technician");

    if (!job) {
      return res.status(404).json({ message: "Job card not found" });
    }

    const oldStatus = job.status;
    const newStatus = req.body.status;

    // Authorization check
    const isTechnician = job.technician?.toString() === req.user.id;
    const isManager = req.user.role === "manager";

    if (!isTechnician && !isManager) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update status
    job.status = newStatus;

    // Track time
    if (newStatus === "IN_PROGRESS" && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (newStatus === "DONE" && !job.completedAt) {
      job.completedAt = new Date();

      // Calculate duration
      if (job.startedAt) {
        const duration = (new Date() - job.startedAt) / (1000 * 60 * 60);
        job.actualDuration = Math.round(duration * 10) / 10;
      }
    }

    // Add to history
    job.statusHistory.push({
      status: newStatus,
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: req.body.notes || `Status changed from ${oldStatus} to ${newStatus}`
    });

    await job.save();

    // Send notifications
    if (req.io) {
      // Notify service advisor of status change
      if (job.createdBy && job.createdBy._id.toString() !== req.user.id) {
        await sendNotification(
          job.createdBy._id,
          "STATUS_CHANGE",
          "Job Status Updated",
          `${job.vehicleNumber} status: ${newStatus}`,
          job._id,
          "MEDIUM",
          req.io
        );
      }
    }

    res.json(job);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// MARK JOB AS CRITICAL (Technician)
exports.markAsCritical = async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id).populate("createdBy");

    if (!job) {
      return res.status(404).json({ message: "Job card not found" });
    }

    if (job.technician?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { criticalReason, priority } = req.body;

    job.isCritical = true;
    job.criticalReason = criticalReason;
    job.priority = priority || "URGENT";

    // Add to history
    job.statusHistory.push({
      status: job.status,
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: `Marked as CRITICAL: ${criticalReason}`
    });

    await job.save();

    // Send urgent notification to service advisor
    if (req.io && job.createdBy) {
      await sendNotification(
        job.createdBy._id,
        "CRITICAL_ISSUE",
        "🚨 Critical Issue Reported",
        `${job.vehicleNumber}: ${criticalReason}`,
        job._id,
        "URGENT",
        req.io
      );
    }

    res.json(job);
  } catch (error) {
    console.error("Mark Critical Error:", error);
    res.status(500).json({ message: "Failed to mark as critical" });
  }
};

// GET JOB CARD BY ID
exports.getJobCardById = async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id)
      .populate("technician", "name role")
      .populate("createdBy", "name role")
      .populate("statusHistory.changedBy", "name role");

    if (!job) {
      return res.status(404).json({ message: "Job card not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
