import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Security: Never return password unless explicitly asked
    },
    image: {
      type: String,
      default: "", // Can be Google profile pic or UploadThing URL
    },
    googleId: {
      type: String, // Stores the Google Subject ID if they link Google Auth
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "super_admin"], // Future proofing
    },
    // Reset Password Logic
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    // Flag to force password change (e.g. after initial seed)
    mustChangePassword: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent "OverwriteModelError" during Next.js hot reloading
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;