const Bill = require("../models/Bill");
const JobCard = require("../models/JobCard");

/**
 * Cashier → Get DONE job cards
 */
exports.getDoneJobCards = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobs = await JobCard.find({ status: "DONE" })
      .populate("technician", "name")
      .populate("createdBy", "name");

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Create Bill
 */
exports.createBill = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { jobCardId, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Bill items required" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + (Number(item.price) * (item.quantity || 1)),
      0
    );

    const bill = await Bill.create({
      jobCard: jobCardId,
      items,
      totalAmount,
      createdBy: req.user.id
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error("❌ BILL SAVE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Mark Bill Paid (Legacy - use togglePaymentStatus instead)
 */
exports.markBillPaid = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.paymentStatus = "PAID";
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Manager + Cashier → Get all bills
 */
exports.getAllBills = async (req, res) => {
  try {
    if (!["manager", "cashier"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bills = await Bill.find()
      .populate({
        path: "jobCard",
        populate: { path: "technician", select: "name" }
      })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Get single bill
 */
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: "jobCard",
        populate: { path: "technician", select: "name" }
      })
      .populate("createdBy", "name");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Update Bill
 */
exports.updateBill = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { items } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Cannot edit paid bill" });
    }

    if (items && items.length > 0) {
      bill.items = items;
      bill.totalAmount = items.reduce(
        (sum, item) => sum + (Number(item.price) * (item.quantity || 1)),
        0
      );
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Delete Bill
 */
exports.deleteBill = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Cannot delete paid bill" });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cashier → Toggle Payment Status (Paid/Unpaid)
 */
exports.togglePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== "cashier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.paymentStatus = bill.paymentStatus === "PAID" ? "PENDING" : "PAID";
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
