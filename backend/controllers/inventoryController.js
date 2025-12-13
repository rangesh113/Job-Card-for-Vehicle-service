const inventoryService = require("../services/inventoryService");

// Search parts
exports.searchParts = async (req, res) => {
    try {
        const { q, vehicleType } = req.query;

        if (!q || q.length < 2) {
            return res.json([]);
        }

        const results = inventoryService.searchParts(q, vehicleType);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get part by ID
exports.getPartById = async (req, res) => {
    try {
        const part = inventoryService.getPartById(req.params.id);

        if (!part) {
            return res.status(404).json({ message: "Part not found" });
        }

        res.json(part);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check stock
exports.checkStock = async (req, res) => {
    try {
        const { partId, quantity } = req.body;

        const stockStatus = inventoryService.checkStock(partId, quantity);
        res.json(stockStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all parts
exports.getAllParts = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            vehicleType: req.query.vehicleType,
            inStock: req.query.inStock === "true",
            lowStock: req.query.lowStock === "true"
        };

        const parts = inventoryService.getAllParts(filters);
        res.json(parts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = inventoryService.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
