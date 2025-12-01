import mongoose from "mongoose";

const GlobalSettingsSchema = new mongoose.Schema(
  {
    // --- Commission Logic ---
    // Determines which calculation strategy to use for transactions
    commissionType: {
      type: String,
      enum: ["percentage", "fixed", "hybrid"],
      default: "percentage",
    },

    // 1. Percentage Strategy (e.g., take 10% of every transaction)
    adminPercentage: {
      type: Number,
      default: 10, // 10%
    },

    // 2. Fixed Fee Strategy (e.g., take $5 flat from every transaction)
    adminFixedFee: {
      type: Number,
      default: 0,
    },

    // 3. Hybrid Strategy
    // "If amount > threshold, take highValueFixedFee. Else, take adminPercentage."
    thresholdAmount: {
      type: Number,
      default: 1000, // e.g., 1000 AUD
    },
    highValueFixedFee: {
      type: Number,
      default: 50, // e.g., 50 AUD fixed
    },

    // --- Platform Maintenance ---
    // If true, user side should show "Under Maintenance" (optional feature)
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },

    // --- Audit Trail ---
    updatedBy: {
      type: String, // Email of the admin who last changed these settings
    },
  },
  {
    timestamps: true, // Tracks updatedAt automatically
  }
);

// We usually only have ONE document of this collection.
const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model("GlobalSettings", GlobalSettingsSchema);

export default GlobalSettings;