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

// Mount routes (without /api prefix since Netlify redirect strips it)
app.use("/auth", authRoutes);
app.use("/jobcards", jobCardRoutes);
app.use("/bills", billRoutes);
app.use("/manager", managerRoutes);
app.use("/notifications", notificationRoutes);
app.use("/inventory", inventoryRoutes);

// Export handler with proper configuration
module.exports.handler = async (event, context) => {
    // Parse body if it's a string (Netlify sends it as base64 encoded)
    if (event.body && event.isBase64Encoded) {
        event.body = Buffer.from(event.body, 'base64').toString('utf8');
    }

    // Call serverless handler without basePath since routes already have /api
    const handler = serverless(app);

    return handler(event, context);
};
