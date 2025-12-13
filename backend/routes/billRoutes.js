const express = require("express");
const router = express.Router();

console.log("✅ billRoutes loaded");

const {
  getDoneJobCards,
  createBill,
  markBillPaid,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  togglePaymentStatus
} = require("../controllers/billController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * ===============================
 * CASHIER ROUTES
 * ===============================
 */

// ✅ Cashier → view completed job cards (DONE)
router.get(
  "/done-jobs",
  protect,
  authorizeRoles("cashier"),
  getDoneJobCards
);

// ✅ Manager + Cashier → view all bills (MUST BE BEFORE /:id)
router.get(
  "/",
  protect,
  authorizeRoles("manager", "cashier"),
  getAllBills
);

// ✅ Cashier → create bill
router.post(
  "/",
  protect,
  authorizeRoles("cashier"),
  createBill
);

// ✅ Cashier → toggle payment status (MUST BE BEFORE /:id)
router.put(
  "/:id/toggle-payment",
  protect,
  authorizeRoles("cashier"),
  togglePaymentStatus
);

// ✅ Cashier → mark bill as paid (legacy, MUST BE BEFORE /:id)
router.put(
  "/:id/pay",
  protect,
  authorizeRoles("cashier"),
  markBillPaid
);

// ✅ Cashier → get single bill
router.get(
  "/:id",
  protect,
  authorizeRoles("cashier", "manager"),
  getBillById
);

// ✅ Cashier → update bill
router.put(
  "/:id",
  protect,
  authorizeRoles("cashier"),
  updateBill
);

// ✅ Cashier → delete bill
router.delete(
  "/:id",
  protect,
  authorizeRoles("cashier"),
  deleteBill
);

module.exports = router;
