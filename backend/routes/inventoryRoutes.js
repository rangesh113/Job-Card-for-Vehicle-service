const express = require("express");
const router = express.Router();

const {
    searchParts,
    getPartById,
    checkStock,
    getAllParts,
    getCategories
} = require("../controllers/inventoryController");

const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Search parts
router.get("/search", searchParts);

// Get all parts
router.get("/parts", getAllParts);

// Get categories
router.get("/categories", getCategories);

// Get part by ID
router.get("/part/:id", getPartById);

// Check stock
router.post("/check-stock", checkStock);

module.exports = router;
