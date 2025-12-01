"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const NotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "warning", "success", "error"]),
  targetGroup: z.enum(["all", "users", "experts", "organisations", "none"]),
  recipientId: z.string().optional(),
  expiresInDays: z.coerce.number().min(1).max(365).optional(), // Helper to calc date
});

export async function createBroadcast(prevState, formData) {
  // 1. Auth Check
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // 2. Validate Input
  const rawData = Object.fromEntries(formData);
  const validated = NotificationSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid Input: " + validated.error.errors[0].message };
  }

  const { title, message, type, targetGroup, recipientId, expiresInDays } = validated.data;

  // 3. Calculate Expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7)); // Default 7 days

  await connectDB();

  try {
    // 4. Create Notification
    await Notification.create({
      title,
      message,
      type,
      targetGroup,
      recipientId: recipientId || null,
      isActive: true,
      expiresAt,
      createdBy: session.user.email,
    });

    revalidatePath("/dashboard"); // Might show up there
    revalidatePath("/newsletter"); // If we add a tab there
    return { success: "Broadcast posted successfully." };
  } catch (error) {
    console.error("Broadcast Error:", error);
    return { error: "Failed to create broadcast." };
  }
}

export async function cancelBroadcast(notificationId) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await connectDB();

  try {
    // Soft delete or just de-activate
    await Notification.findByIdAndUpdate(notificationId, {
      isActive: false,
    });
    
    revalidatePath("/newsletter");
    return { success: "Broadcast cancelled." };
  } catch (error) {
    return { error: "Database error" };
  }
}

// Fetch helper for Admin UI
export async function getActiveBroadcasts() {
  const session = await auth();
  if (!session?.user) return [];

  await connectDB();
  
  return Notification.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
}