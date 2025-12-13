const express = require("express");
const router = express.Router();

const {
  createJobCard,
  getAllJobCards,
  getMyJobCards,
  updateJobStatus,
  addServiceSummary,
  markAsCritical,
  getJobCardById
} = require("../controllers/jobCardController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Advisor - Create job card
router.post("/", protect, authorizeRoles("advisor"), createJobCard);

// Manager / Advisor - Get all job cards (with search/filter)
router.get("/", protect, authorizeRoles("manager", "advisor"), getAllJobCards);

// Technician – My Jobs
router.get("/my", protect, authorizeRoles("technician"), getMyJobCards);

// Get job card by ID
router.get("/:id", protect, getJobCardById);

// Technician – Update status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("technician", "manager"),
  updateJobStatus
);

// Technician – Add Service Summary
router.put(
  "/:id/summary",
  protect,
  authorizeRoles("technician"),
  addServiceSummary
);

// Technician – Mark as Critical
router.put(
  "/:id/critical",
  protect,
  authorizeRoles("technician"),
  markAsCritical
);

module.exports = router;
