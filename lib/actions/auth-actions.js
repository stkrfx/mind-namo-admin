"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { saltAndHashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

// --- Validation Schemas ---

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// --- Actions ---

export async function authenticate(prevState, formData) {
  // 1. Rate Limit Check (IP based)
  try {
    // In server actions, getting IP is tricky, so we use the email as a proxy for the limiter key
    // or a generic string if not available yet.
    const emailIp = formData.get("email"); 
    await checkRateLimit(`login_${emailIp}`);
  } catch (error) {
    return "Too many login attempts. Please try again later.";
  }

  // 2. Validate Fields
  const formEntries = Object.fromEntries(formData);
  const validatedFields = LoginSchema.safeParse(formEntries);

  if (!validatedFields.success) {
    return "Invalid email or password format.";
  }

  const { email, password } = validatedFields.data;

  // 3. Attempt Login via NextAuth
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect in the UI for smoother UX
    });
    return null; // Success implies no error message
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function forgotPassword(prevState, formData) {
  const email = formData.get("email");

  // 1. Rate Limit
  try {
    await checkRateLimit(`forgot_${email}`);
  } catch (error) {
    return { error: "Too many requests. Try again in a minute." };
  }

  // 2. Validate
  const validatedFields = ForgotPasswordSchema.safeParse({ email });
  if (!validatedFields.success) {
    return { error: "Invalid email address." };
  }

  await connectDB();

  // 3. Find Admin
  const admin = await Admin.findOne({ email: validatedFields.data.email });

  if (!admin) {
    // SECURITY: Return success even if user not found to prevent Email Enumeration
    return { success: "If that email exists, a reset link has been sent." };
  }

  // 4. Generate Reset Token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // Set expiry to 1 hour from now
  const resetTokenExpiry = new Date(Date.now() + 3600000); 

  admin.resetPasswordToken = resetToken;
  admin.resetPasswordExpires = resetTokenExpiry;
  await admin.save();

  // 5. Send Email (TODO: Integrate with your Email Template system later)
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;
  
  console.log("---------------------------------------------------");
  console.log(`[MOCK EMAIL] To: ${email}`);
  console.log(`[MOCK EMAIL] Subject: Reset Your Password`);
  console.log(`[MOCK EMAIL] Link: ${resetLink}`);
  console.log("---------------------------------------------------");

  // In production, you would call your email service here using the 'email-actions'
  // await sendEmail({ to: email, template: 'forgot-password', data: { link: resetLink } });

  return { success: "If that email exists, a reset link has been sent." };
}

export async function resetPassword(token, prevState, formData) {
  // 1. Rate Limit
  try {
    await checkRateLimit(`reset_${token}`);
  } catch (error) {
    return { error: "Too many requests. Try again later." };
  }

  // 2. Validate Form
  const formEntries = Object.fromEntries(formData);
  const validatedFields = ResetPasswordSchema.safeParse(formEntries);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.confirmPassword?.[0] || "Invalid input" };
  }

  await connectDB();

  // 3. Find Admin with valid Token
  const admin = await Admin.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Expiry must be in the future
  });

  if (!admin) {
    return { error: "Invalid or expired reset token." };
  }

  // 4. Update Password
  const hashedPassword = await saltAndHashPassword(validatedFields.data.password);
  
  admin.password = hashedPassword;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  // If they were forced to change password, we can clear that flag here if you want,
  // or handle it in a separate logic. For now, assume a reset implies a valid change.
  // admin.mustChangePassword = false; 
  
  await admin.save();

  return { success: "Password reset successfully. You can now login." };
}