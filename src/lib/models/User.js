import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
    // Randomly assigned initially, editable once
    username: {
      type: String,
      unique: true,
      required: true, 
      trim: true,
    },
    isUsernameChanged: {
      type: Boolean,
      default: false, // Tracks if they have used their 1-time change
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users to have 'null' mobile numbers
    },
    image: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      select: false,
    },
    // Admin Control Fields
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String, // Optional: Admin can add a note why they were banned
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;