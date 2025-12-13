const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllJobs,
  getTechnicians   // 👈 ADD THIS
} = require("../controllers/managerController");

const { protect } = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", protect, getDashboardStats);

// Kanban
router.get("/jobs", protect, getAllJobs);

// ✅ NEW: Get all technicians
router.get("/technicians", protect, getTechnicians);

module.exports = router;
