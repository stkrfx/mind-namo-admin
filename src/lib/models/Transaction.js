import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    // --- Relationships ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      default: null, // Optional if expert is independent
    },
    // Reference to the actual service (store ID as string or ObjectId)
    serviceId: {
      type: String, // ID of the Appointment or Assignment
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["appointment", "assignment", "subscription"],
      required: true,
    },

    // --- Financial Breakdown (Stored immutably at creation) ---
    amount: {
      type: Number, // Total amount paid by user
      required: true,
    },
    currency: {
      type: String,
      default: "AUD",
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    // The cut calculated based on settings at that time
    adminShare: {
      type: Number,
      default: 0,
    },
    expertShare: {
      type: Number,
      default: 0,
    },
    orgShare: {
      type: Number,
      default: 0,
    },

    // --- Status Tracking ---
    status: {
      type: String,
      enum: [
        "pending",          // User paid, service upcoming
        "under_review",     // Service done, awaiting verification (OTP/Admin check)
        "completed",        // Verified, revenue recognized
        "settled",          // Payout sent to Expert/Org
        "unattended",       // Expert didn't show up
        "cancelled_pending_refund", // User cancelled, Admin must approve refund
        "refunded",         // Money sent back to user
      ],
      default: "pending",
    },

    // --- Timestamps & Metadata ---
    paymentGatewayId: {
      type: String, // Stripe/PayPal ID
    },
    settledAt: {
      type: Date, // When the payout was actually made
    },
    refundReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast dashboard reporting
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default Transaction;