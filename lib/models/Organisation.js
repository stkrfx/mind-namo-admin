import mongoose from "mongoose";

const OrganisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organisation name is required"],
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
    // Randomly assigned initially (e.g., org_8x92ka), editable once
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
      default: "", // Logo
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },

    // --- Auth & Security ---
    // If true, the user MUST change their password upon next login.
    // Used when Admin manually creates the account with public credentials.
    requiresPasswordChange: {
      type: Boolean,
      default: false,
    },

    // --- Status & Visibility ---
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending", 
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isListed: {
      type: Boolean,
      default: true,
    },

    // --- Financial Settings ---
    // Override global settings for this specific organisation if needed
    customCommissionPercentage: {
      type: Number, 
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Organisation = mongoose.models.Organisation || mongoose.model("Organisation", OrganisationSchema);

export default Organisation;