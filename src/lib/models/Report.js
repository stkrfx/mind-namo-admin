import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    // --- The Whistleblower (Reporter) ---
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reporterModel", // Dynamic reference
    },
    reporterModel: {
      type: String,
      required: true,
      enum: ["User", "Expert", "Organisation"],
    },

    // --- The Accused (Reported) ---
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "reportedModel",
    },
    reportedModel: {
      type: String,
      required: true,
      enum: ["User", "Expert", "Organisation"],
    },

    // --- The Allegation ---
    category: {
      type: String,
      enum: [
        "abusive_language",
        "scam_spam",
        "inappropriate_behavior",
        "fake_profile",
        "other",
      ],
      required: true,
    },
    description: {
      type: String, // User's written explanation
      default: "",
    },

    // --- Evidence ---
    // Critical for Admin: Link to the specific chat room where it happened.
    // The Admin Action will use this ID to fetch and decrypt the chat history.
    relatedRoomId: {
      type: String, 
      default: null,
    },

    // --- Admin Handling ---
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: {
      type: String, // Internal notes for admins regarding this case
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;