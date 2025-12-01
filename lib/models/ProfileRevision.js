import mongoose from "mongoose";

const ProfileRevisionSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
      unique: true, // Only one pending revision allowed per expert at a time
    },
    
    // This object stores ONLY the fields that were changed.
    // e.g. { bio: "New Bio", price: 500 }
    updates: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },

    // Snapshot of what the profile looked like BEFORE this change
    // Useful for the Admin "Diff View" to compare side-by-side
    originalSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },

    status: {
      type: String,
      enum: ["pending", "rejected"], 
      // Note: We don't need "approved" status because approving 
      // deletes this document and updates the main Expert document.
      default: "pending",
    },

    rejectionReason: {
      type: String, // If admin rejects, they write why here
    },
    
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ProfileRevision = mongoose.models.ProfileRevision || mongoose.model("ProfileRevision", ProfileRevisionSchema);

export default ProfileRevision;