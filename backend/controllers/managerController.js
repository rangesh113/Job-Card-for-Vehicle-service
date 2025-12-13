const JobCard = require("../models/JobCard");
const Bill = require("../models/Bill");
const User = require("../models/User");
// MANAGER DASHBOARD CARDS
exports.getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await JobCard.countDocuments();
    const completedJobs = await JobCard.countDocuments({ status: "DONE" });
    const pendingJobs = await JobCard.countDocuments({ status: { $ne: "DONE" } });

    const bills = await Bill.find({ paymentStatus: "PAID" });
    const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      totalJobs,
      completedJobs,
      pendingJobs,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ REQUIRED FOR KANBAN
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await JobCard.find()
      .populate("technician", "name")
      .populate("createdBy", "name");

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL TECHNICIANS (FOR ADVISOR)
exports.getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technician" })
      .select("_id name");

    res.json(technicians);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
