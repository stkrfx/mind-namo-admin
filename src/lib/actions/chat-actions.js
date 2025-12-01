"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Chat from "@/lib/models/Chat";
import Report from "@/lib/models/Report";
import User from "@/lib/models/User"; // Needed to populate names
import Expert from "@/lib/models/Expert";
import Organisation from "@/lib/models/Organisation";
import { decrypt } from "@/lib/crypto";

// --- Helpers ---
async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Fetches all active support conversations for the Admin Chat Page.
 * Returns a list of users/experts who have chatted with Admin.
 */
export async function getAdminConversations() {
  await assertAdmin();
  await connectDB();

  // Aggregate to find unique conversation partners (roomId usually contains user IDs)
  // Assuming roomId format for admin support is "admin-userId"
  const conversations = await Chat.aggregate([
    { $match: { roomId: { $regex: /^admin-/ } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$roomId",
        lastMessage: { $first: "$message" },
        lastMessageTime: { $first: "$createdAt" },
        senderId: { $first: "$senderId" },
        receiverId: { $first: "$receiverId" },
        unreadCount: { 
          $sum: { 
            $cond: [{ $and: [{ $eq: ["$read", false] }, { $ne: ["$senderId", "admin"] }] }, 1, 0] 
          } 
        }
      }
    }
  ]);

  // We need to fetch details (Name/Avatar) for the other party in the conversation
  const populatedConversations = await Promise.all(conversations.map(async (conv) => {
    // Decrypt the last message preview
    const decryptedPreview = decrypt(conv.lastMessage);
    
    // Extract userId from roomId "admin-USERID"
    const otherUserId = conv._id.replace("admin-", "");
    
    // Try finding them in User, Expert, or Org collections
    let userDetails = await User.findById(otherUserId).select("name image email").lean() 
      || await Expert.findById(otherUserId).select("name image email").lean()
      || await Organisation.findById(otherUserId).select("name image email").lean();

    return {
      roomId: conv._id,
      lastMessage: decryptedPreview,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unreadCount,
      otherUser: userDetails || { name: "Unknown User", image: null, email: "N/A" }
    };
  }));

  // Sort by most recent activity
  return populatedConversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
}

/**
 * Fetches messages for a specific chat room.
 * Decrypts content before returning.
 */
export async function getChatMessages(roomId) {
  await assertAdmin();
  await connectDB();

  const messages = await Chat.find({ roomId })
    .sort({ createdAt: 1 }) // Oldest first
    .lean();

  return messages.map(msg => ({
    ...msg,
    // Decrypt the content. If it was deleted, we still decrypt it 
    // because Admin needs to see what was deleted (as per requirements)
    message: decrypt(msg.message), 
    // Determine if it's an image/audio (usually stored in fileUrl, message text might be empty or caption)
    type: msg.fileUrl ? (msg.fileType || 'image') : 'text',
  }));
}

/**
 * Fetches all Pending Reports (Misbehavior/Abuse).
 */
export async function getReports() {
  await assertAdmin();
  await connectDB();

  // Find reports not yet resolved
  const reports = await Report.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .populate("reporterId", "name email role") // Who reported
    .populate("reportedId", "name email role") // Who was reported
    .lean();

  return reports;
}

/**
 * Fetches details for a specific report, including the CONTEXT (Chat History).
 * Admin needs to see the chat where the abuse happened.
 */
export async function getReportDetails(reportId) {
  await assertAdmin();
  await connectDB();

  const report = await Report.findById(reportId)
    .populate("reporterId", "name email image")
    .populate("reportedId", "name email image")
    .lean();

  if (!report) return null;

  // Fetch the chat history associated with this report's context
  // Assuming report stores 'relatedRoomId' or we derive it from user IDs
  const roomId = report.relatedRoomId; 
  
  let chatHistory = [];
  if (roomId) {
    const chats = await Chat.find({ roomId }).sort({ createdAt: 1 }).lean();
    chatHistory = chats.map(msg => ({
      ...msg,
      message: decrypt(msg.message),
      isDeleted: msg.isDeleted // UI will use this to show "lighter colour"
    }));
  }

  return {
    report,
    chatHistory
  };
}

/**
 * Marks a report as Resolved/Dismissed.
 */
export async function resolveReport(reportId, resolutionStatus = "resolved") {
  await assertAdmin();
  await connectDB();

  await Report.findByIdAndUpdate(reportId, {
    status: resolutionStatus,
    resolvedAt: new Date(),
    // We could store which admin resolved it if we had admin ID in context
  });

  return { success: true };
}