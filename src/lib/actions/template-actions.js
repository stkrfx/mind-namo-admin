"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db";
import EmailTemplate from "@/lib/models/EmailTemplate";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TemplateSchema = z.object({
  _id: z.string(),
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "Content cannot be empty"),
});

export async function saveTemplateAction(data) {
  // 1. Auth Check
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 2. Validation
  const validated = TemplateSchema.safeParse(data);
  if (!validated.success) {
    throw new Error("Invalid Input");
  }

  const { _id, subject, htmlContent } = validated.data;

  await connectDB();

  // 3. Update DB
  try {
    await EmailTemplate.findByIdAndUpdate(
      _id,
      {
        subject,
        htmlContent,
        lastUpdatedBy: session.user.email,
        active: true,
      },
      { new: true }
    );

    // 4. Revalidate to show changes immediately
    revalidatePath("/templates");
    return { success: true };
  } catch (error) {
    console.error("Template Save Error:", error);
    throw new Error("Database Update Failed");
  }
}