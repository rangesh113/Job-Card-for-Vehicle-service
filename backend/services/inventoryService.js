// Mock Inventory Service - Simulates 3rd Party Inventory System API

class InventoryService {
    constructor() {
        // Mock inventory database
        this.inventory = [
            // 2-Wheeler Parts
            { id: "P001", partNumber: "OIL-2W-001", name: "Engine Oil (2-Wheeler)", category: "Oil", price: 450, stock: 50, vehicleType: "2-wheeler" },
            { id: "P002", partNumber: "BRAKE-2W-001", name: "Brake Pads (2-Wheeler)", category: "Brakes", price: 850, stock: 30, vehicleType: "2-wheeler" },
            { id: "P003", partNumber: "CHAIN-2W-001", name: "Chain Set", category: "Drive", price: 1200, stock: 20, vehicleType: "2-wheeler" },
            { id: "P004", partNumber: "SPARK-2W-001", name: "Spark Plug", category: "Engine", price: 150, stock: 100, vehicleType: "2-wheeler" },
            { id: "P005", partNumber: "AIR-2W-001", name: "Air Filter (2-Wheeler)", category: "Filter", price: 250, stock: 45, vehicleType: "2-wheeler" },
            { id: "P006", partNumber: "TIRE-2W-001", name: "Front Tire (2-Wheeler)", category: "Tires", price: 2500, stock: 15, vehicleType: "2-wheeler" },
            { id: "P007", partNumber: "TIRE-2W-002", name: "Rear Tire (2-Wheeler)", category: "Tires", price: 2800, stock: 15, vehicleType: "2-wheeler" },
            { id: "P008", partNumber: "BATTERY-2W-001", name: "Battery (2-Wheeler)", category: "Electrical", price: 1800, stock: 25, vehicleType: "2-wheeler" },
            { id: "P009", partNumber: "CLUTCH-2W-001", name: "Clutch Plate Set", category: "Transmission", price: 950, stock: 18, vehicleType: "2-wheeler" },
            { id: "P010", partNumber: "CABLE-2W-001", name: "Clutch Cable", category: "Cables", price: 180, stock: 40, vehicleType: "2-wheeler" },

            // 4-Wheeler Parts
            { id: "P011", partNumber: "OIL-4W-001", name: "Engine Oil (4-Wheeler)", category: "Oil", price: 1200, stock: 60, vehicleType: "4-wheeler" },
            { id: "P012", partNumber: "BRAKE-4W-001", name: "Brake Pads (4-Wheeler)", category: "Brakes", price: 2500, stock: 35, vehicleType: "4-wheeler" },
            { id: "P013", partNumber: "AIR-4W-001", name: "Air Filter (4-Wheeler)", category: "Filter", price: 450, stock: 50, vehicleType: "4-wheeler" },
            { id: "P014", partNumber: "SPARK-4W-001", name: "Spark Plugs Set (4)", category: "Engine", price: 800, stock: 40, vehicleType: "4-wheeler" },
            { id: "P015", partNumber: "BATTERY-4W-001", name: "Battery (4-Wheeler)", category: "Electrical", price: 4500, stock: 20, vehicleType: "4-wheeler" },
            { id: "P016", partNumber: "TIRE-4W-001", name: "Tire (4-Wheeler)", category: "Tires", price: 4500, stock: 25, vehicleType: "4-wheeler" },
            { id: "P017", partNumber: "WIPER-4W-001", name: "Wiper Blades (Pair)", category: "Accessories", price: 350, stock: 55, vehicleType: "4-wheeler" },
            { id: "P018", partNumber: "COOLANT-4W-001", name: "Coolant (1L)", category: "Fluids", price: 280, stock: 70, vehicleType: "4-wheeler" },
            { id: "P019", partNumber: "BELT-4W-001", name: "Timing Belt", category: "Engine", price: 1800, stock: 22, vehicleType: "4-wheeler" },
            { id: "P020", partNumber: "SHOCK-4W-001", name: "Shock Absorber", category: "Suspension", price: 3200, stock: 12, vehicleType: "4-wheeler" },

            // Common Parts
            { id: "P021", partNumber: "BULB-001", name: "Headlight Bulb", category: "Electrical", price: 120, stock: 80, vehicleType: "both" },
            { id: "P022", partNumber: "FUSE-001", name: "Fuse Set", category: "Electrical", price: 50, stock: 150, vehicleType: "both" },
            { id: "P023", partNumber: "GREASE-001", name: "Grease (500g)", category: "Lubricants", price: 180, stock: 60, vehicleType: "both" },
        ];
    }

    /**
     * Search parts by query string
     * @param {string} query - Search query
     * @param {string} vehicleType - Optional filter by vehicle type
     * @returns {Array} - Matching parts
     */
    searchParts(query, vehicleType = null) {
        if (!query || query.length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase();
        let results = this.inventory.filter(part =>
            part.name.toLowerCase().includes(searchTerm) ||
            part.partNumber.toLowerCase().includes(searchTerm) ||
            part.category.toLowerCase().includes(searchTerm)
        );

        // Filter by vehicle type if specified
        if (vehicleType) {
            results = results.filter(part =>
                part.vehicleType === vehicleType || part.vehicleType === "both"
            );
        }

        // Return top 10 results
        return results.slice(0, 10).map(part => ({
            id: part.id,
            partNumber: part.partNumber,
            name: part.name,
            category: part.category,
            price: part.price,
            stock: part.stock,
            inStock: part.stock > 0,
            lowStock: part.stock < 10
        }));
    }

    /**
     * Get part details by ID
     * @param {string} partId - Part ID
     * @returns {Object|null} - Part details or null
     */
    getPartById(partId) {
        const part = this.inventory.find(p => p.id === partId);
        if (!part) return null;

        return {
            id: part.id,
            partNumber: part.partNumber,
            name: part.name,
            category: part.category,
            price: part.price,
            stock: part.stock,
            vehicleType: part.vehicleType,
            inStock: part.stock > 0,
            lowStock: part.stock < 10,
            description: `${part.name} - ${part.category}`,
            warranty: "6 months"
        };
    }

    /**
     * Check stock availability
     * @param {string} partId - Part ID
     * @param {number} quantity - Required quantity
     * @returns {Object} - Stock status
     */
    checkStock(partId, quantity = 1) {
        const part = this.inventory.find(p => p.id === partId);
        if (!part) {
            return {
                available: false,
                message: "Part not found",
                currentStock: 0
            };
        }

        const available = part.stock >= quantity;
        return {
            available,
            message: available
                ? `${part.stock} units available`
                : `Only ${part.stock} units available, ${quantity} requested`,
            currentStock: part.stock,
            requestedQuantity: quantity
        };
    }

    /**
     * Reserve parts (simulate reservation)
     * @param {string} partId - Part ID
     * @param {number} quantity - Quantity to reserve
     * @returns {Object} - Reservation result
     */
    reservePart(partId, quantity = 1) {
        const part = this.inventory.find(p => p.id === partId);
        if (!part) {
            return {
                success: false,
                message: "Part not found"
            };
        }

        if (part.stock < quantity) {
            return {
                success: false,
                message: `Insufficient stock. Available: ${part.stock}, Requested: ${quantity}`
            };
        }

        // Simulate reservation (in real system, this would update database)
        part.stock -= quantity;

        return {
            success: true,
            message: `Reserved ${quantity} unit(s) of ${part.name}`,
            partId: part.id,
            partName: part.name,
            quantity,
            remainingStock: part.stock
        };
    }

    /**
     * Get all parts (with optional filters)
     * @param {Object} filters - Filter options
     * @returns {Array} - Filtered parts
     */
    getAllParts(filters = {}) {
        let results = [...this.inventory];

        if (filters.category) {
            results = results.filter(p => p.category === filters.category);
        }

        if (filters.vehicleType) {
            results = results.filter(p =>
                p.vehicleType === filters.vehicleType || p.vehicleType === "both"
            );
        }

        if (filters.inStock) {
            results = results.filter(p => p.stock > 0);
        }

        if (filters.lowStock) {
            results = results.filter(p => p.stock < 10 && p.stock > 0);
        }

        return results.map(part => ({
            id: part.id,
            partNumber: part.partNumber,
            name: part.name,
            category: part.category,
            price: part.price,
            stock: part.stock,
            inStock: part.stock > 0,
            lowStock: part.stock < 10
        }));
    }

    /**
     * Get categories
     * @returns {Array} - List of categories
     */
    getCategories() {
        const categories = [...new Set(this.inventory.map(p => p.category))];
        return categories.sort();
    }
}

// Export singleton instance
module.exports = new InventoryService();
