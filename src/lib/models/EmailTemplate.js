import mongoose from "mongoose";

const EmailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Human readable name (e.g. "OTP Verification Email")
      required: true,
    },
    slug: {
      type: String, // System identifier (e.g. "otp_verification")
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String, // The email subject line
      required: true,
    },
    htmlContent: {
      type: String, // The actual HTML string
      required: true,
    },
    // Hints for the admin UI to know what variables are available
    // e.g. ["{{name}}", "{{otp}}", "{{expiry}}"]
    availableVariables: {
      type: [String], 
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: String, // Email of the admin who last edited it
    },
  },
  {
    timestamps: true,
  }
);

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", EmailTemplateSchema);

export default EmailTemplate;