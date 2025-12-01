import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true, // Crucial for fetching chat history fast
    },
    senderId: {
      type: String, // Can be ObjectId of User/Expert OR "admin"
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    
    // --- Content ---
    message: {
      type: String, // Stores ENCRYPTED string "iv:encrypted_data"
      default: "",  // Can be empty if it's just a file upload
    },
    
    // --- Attachments (via UploadThing) ---
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "audio", null],
      default: null,
    },

    // --- Status ---
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },

    // --- Audit & Safety ---
    // If a user "deletes" a message, we just flag it.
    // It is HIDDEN from the other user, but VISIBLE to Admin (in ghost/light mode).
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting messages by time within a room
ChatSchema.index({ roomId: 1, createdAt: 1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;