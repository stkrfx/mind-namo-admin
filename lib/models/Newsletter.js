import mongoose from "mongoose";

const NewsletterSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String, // HTML content
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "users", "experts", "organisations"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    sentAt: {
      type: Date,
    },
    sentBy: {
      type: String, // Admin email
    },
    // Snapshots the number of emails this was sent to
    recipientCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema);

export default Newsletter;