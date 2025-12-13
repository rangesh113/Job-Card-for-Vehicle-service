const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  partId: String,           // Inventory system part ID
  partNumber: String,       // Part number from inventory
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  stockAvailable: Number    // Stock at time of billing
});

const billSchema = new mongoose.Schema(
  {
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true
    },

    items: [billItemSchema],

    serviceCharge: {
      type: Number,
      default: 0
    },

    sparePartsCharge: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
