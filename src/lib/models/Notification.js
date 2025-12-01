import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    
    // --- Targeting Logic ---
    // If 'recipientId' is present, it's a private message to one person.
    // If 'recipientId' is null, it looks at 'targetGroup'.
    recipientId: {
      type: String, // Can be User/Expert/Org ID
      default: null,
      index: true,
    },
    targetGroup: {
      type: String,
      enum: ["all", "users", "experts", "organisations", "none"], // 'none' if specific recipient
      default: "none",
    },

    // --- Visibility Control ---
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date, // Auto-hide after this date
    },

    // --- Audit ---
    createdBy: {
      type: String, // Admin email
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval on the user side
// e.g. Find all active notifications for group 'experts'
NotificationSchema.index({ targetGroup: 1, isActive: 1 });
NotificationSchema.index({ recipientId: 1, isActive: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;