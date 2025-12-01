import mongoose from "mongoose";

const ExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    // Randomly assigned initially, editable once
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    isUsernameChanged: {
      type: Boolean,
      default: false,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    specialization: {
      type: [String], // Array of strings (e.g., ["Cardiology", "Therapy"])
      default: [],
    },
    
    // --- Organisation Relationship ---
    // If null, they are an independent expert
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      default: null,
    },

    // --- Status & Visibility ---
    // 'pending': Just signed up, not visible yet
    // 'verified': Visible and active
    // 'rejected': Admin rejected the initial application
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    
    // Admin controls to hide them immediately
    isBanned: {
      type: Boolean,
      default: false,
    },
    // Admin can 'unlist' them (hide from search) without banning
    isListed: {
      type: Boolean,
      default: true,
    },

    // --- Profile Update Logic ---
    // If true, Admin will see a "Review Changes" badge in the dashboard
    hasPendingUpdate: {
      type: Boolean,
      default: false,
    },

    // --- Financial Settings ---
    // Optional: If set, this specific expert gets a different split than the global default
    customCommissionPercentage: {
      type: Number, // e.g., 80 (Expert keeps 80%)
      default: null, 
    }
  },
  {
    timestamps: true,
  }
);

const Expert = mongoose.models.Expert || mongoose.model("Expert", ExpertSchema);

export default Expert;