const serverless = require("serverless-http");
const express = require("express");
const connectDB = require("./utils/db");

// Import routes
const authRoutes = require("../../backend/routes/authRoutes");
const jobCardRoutes = require("../../backend/routes/jobCardRoutes");
const billRoutes = require("../../backend/routes/billRoutes");
const managerRoutes = require("../../backend/routes/managerRoutes");
const notificationRoutes = require("../../backend/routes/notificationRoutes");
const inventoryRoutes = require("../../backend/routes/inventoryRoutes");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// CORS headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/jobcards", jobCardRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);

// Export handler with proper configuration
module.exports.handler = serverless(app, {
    basePath: '/api',
    request(request, event, context) {
        // Ensure body is properly parsed
        if (event.body && typeof event.body === 'string') {
            try {
                request.body = JSON.parse(event.body);
            } catch (e) {
                request.body = event.body;
            }
        }
    }
});
