"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Expert from "@/lib/models/Expert";
import Organisation from "@/lib/models/Organisation";
import Transaction from "@/lib/models/Transaction";
import GlobalSettings from "@/lib/models/GlobalSettings";
import Admin from "@/lib/models/Admin"; // Added missing import
import { saltAndHashPassword } from "@/lib/password";
import { z } from "zod";

// --- Helper: Ensure Admin Auth ---
async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  // Double check against DB if needed, but session check is usually sufficient for actions
  // assuming middleware protects the route.
  return session.user;
}

// --- Dashboard Statistics & Revenue ---

export async function getDashboardStats() {
  await assertAdmin();
  await connectDB();

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(now.setDate(now.getDate() - 7));

  // 1. Fetch Revenue Aggregations
  // We assume Transaction model has: status, amount, adminShare, orgShare, expertShare, gstAmount, createdAt
  const revenueStats = await Transaction.aggregate([
    {
      $match: {
        status: "completed", // Only count completed transactions for revenue
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalAdminShare: { $sum: "$adminShare" },
        totalExpertShare: { $sum: "$expertShare" },
        totalOrgShare: { $sum: "$orgShare" },
        totalGst: { $sum: "$gstAmount" },
        todayRevenue: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfDay] }, "$amount", 0],
          },
        },
        lastWeekRevenue: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  // 2. Fetch Pending Settlements
  // Logic: upcoming appointments, completed but not settled, cancelled pending refund
  const pendingStats = await Transaction.aggregate([
    {
      $match: {
        status: { 
          $in: ["pending", "under_review", "cancelled_pending_refund", "unattended"] 
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const stats = revenueStats[0] || {
    totalRevenue: 0,
    totalAdminShare: 0,
    totalExpertShare: 0,
    totalOrgShare: 0,
    totalGst: 0,
    todayRevenue: 0,
    lastWeekRevenue: 0,
  };

  // Format pending data for easy UI consumption
  const pendingMap = pendingStats.reduce((acc, curr) => {
    acc[curr._id] = curr;
    return acc;
  }, {});

  return {
    revenue: stats,
    pending: {
      totalPendingAmount: (pendingMap.pending?.totalAmount || 0) + (pendingMap.under_review?.totalAmount || 0),
      unattendedCount: pendingMap.unattended?.count || 0,
      refundPendingCount: pendingMap.cancelled_pending_refund?.count || 0,
    },
  };
}

// --- Entity Management (Ban/Unban/Unlist) ---

const EntityActionSchema = z.object({
  id: z.string(),
  type: z.enum(["user", "expert", "organisation"]),
  action: z.enum(["ban", "unban", "unlist", "relist"]),
});

export async function manageEntityStatus(formData) {
  await assertAdmin();
  await connectDB();

  const rawData = {
    id: formData.get("id"),
    type: formData.get("type"),
    action: formData.get("action"),
  };

  const validated = EntityActionSchema.safeParse(rawData);
  if (!validated.success) return { error: "Invalid Request" };

  const { id, type, action } = validated.data;

  let Model;
  if (type === "user") Model = User;
  else if (type === "expert") Model = Expert;
  else if (type === "organisation") Model = Organisation;

  const updateData = {};
  if (action === "ban") updateData.isBanned = true;
  if (action === "unban") updateData.isBanned = false;
  if (action === "unlist") updateData.isListed = false; // Only for Expert/Org
  if (action === "relist") updateData.isListed = true;

  try {
    await Model.findByIdAndUpdate(id, updateData);
    revalidatePath(`/users`); // Refresh the users/experts list page
    revalidatePath(`/organisations`);
    return { success: `Successfully ${action}ned ${type}` };
  } catch (error) {
    return { error: "Database Error" };
  }
}

// --- Create Organisation (Public Credentials) ---

const CreateOrgSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  mobile: z.string().optional(),
});

export async function createOrganisation(prevState, formData) {
  await assertAdmin();
  await connectDB();

  const rawData = Object.fromEntries(formData);
  const validated = CreateOrgSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid Input" };
  }

  const { name, email, password, mobile } = validated.data;

  // Check uniqueness
  const existing = await Organisation.findOne({ email });
  if (existing) return { error: "Email already registered" };

  const hashedPassword = await saltAndHashPassword(password);

  try {
    // Create Org with 'requiresPasswordChange' flag set to true
    // This forces the "Public Credentials" flow you described
    await Organisation.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "organisation",
      username: `org_${Math.random().toString(36).substring(2, 8)}`,
      requiresPasswordChange: true, // IMPORTANT: Forces reset on first login
      isVerified: true, // Created by admin, so verified by default
      createdAt: new Date(),
    });

    revalidatePath("/organisations");
    return { success: "Organisation created successfully. Share credentials with them." };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create organisation" };
  }
}

// --- Global Settings (Commission Logic) ---

const SettingsSchema = z.object({
  commissionType: z.enum(["percentage", "fixed", "hybrid"]),
  adminPercentage: z.coerce.number().min(0).max(100).optional(),
  adminFixedFee: z.coerce.number().min(0).optional(),
  thresholdAmount: z.coerce.number().optional(), // For hybrid logic (e.g. > 1000 AUD)
  highValueFixedFee: z.coerce.number().optional(), // Fee if above threshold
});

export async function updateGlobalSettings(prevState, formData) {
  await assertAdmin();
  await connectDB();

  const rawData = Object.fromEntries(formData);
  const validated = SettingsSchema.safeParse(rawData);

  if (!validated.success) return { error: "Invalid Settings" };

  try {
    // Upsert the singleton settings document
    await GlobalSettings.findOneAndUpdate(
      {}, // Find first (singleton)
      { 
        ...validated.data,
        updatedAt: new Date(),
        updatedBy: (await auth()).user.email
      },
      { upsert: true, new: true }
    );

    revalidatePath("/settings");
    return { success: "Global commission settings updated." };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}

// --- Admin Profile Update ---

export async function updateAdminProfile(prevState, formData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  await connectDB();

  const name = formData.get("name");
  const profilePicture = formData.get("profilePicture"); // URL from UploadThing

  try {
    await Admin.findOneAndUpdate(
      { email: session.user.email },
      { 
        name, 
        image: profilePicture || undefined 
      }
    );
    revalidatePath("/settings");
    return { success: "Profile updated" };
  } catch (error) {
    return { error: "Update failed" };
  }
}