"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Newsletter from "@/lib/models/Newsletter";
import User from "@/lib/models/User";
import Expert from "@/lib/models/Expert";
import Organisation from "@/lib/models/Organisation";
import { revalidatePath } from "next/cache";

export async function sendNewsletterAction({ subject, targetAudience, content }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectDB();

  // 1. Calculate Recipients (Mock Logic for Count)
  let count = 0;
  
  if (targetAudience === "all") {
    const [u, e, o] = await Promise.all([
        User.countDocuments({ isBanned: false }),
        Expert.countDocuments({ isBanned: false }),
        Organisation.countDocuments({ isBanned: false })
    ]);
    count = u + e + o;
  } else if (targetAudience === "users") {
    count = await User.countDocuments({ isBanned: false });
  } else if (targetAudience === "experts") {
    count = await Expert.countDocuments({ isBanned: false });
  } else if (targetAudience === "organisations") {
    count = await Organisation.countDocuments({ isBanned: false });
  }

  // 2. Create Record
  try {
    await Newsletter.create({
      subject,
      content,
      targetAudience,
      status: "sent",
      sentAt: new Date(),
      sentBy: session.user.email,
      recipientCount: count,
    });

    // 3. Trigger Email Service (Mocking the loop)
    // In production: await emailService.sendBulk({ ... })
    console.log(`[MOCK EMAIL SERVICE] Broadcasting "${subject}" to ${count} recipients in group ${targetAudience}`);

    revalidatePath("/newsletter");
    return { success: true, count };
  } catch (error) {
    console.error("Newsletter Error:", error);
    return { success: false };
  }
}