const mongoose = require("mongoose");

// Cached connection for serverless optimization
let cachedConnection = null;

const connectDB = async () => {
    // Reuse existing connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log("✅ Using cached MongoDB connection");
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Optimized settings for serverless
            maxPoolSize: 5,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            connectTimeoutMS: 30000,
            bufferCommands: false, // Disable buffering
        });

        cachedConnection = conn;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
