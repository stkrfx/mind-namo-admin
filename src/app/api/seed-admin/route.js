import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { saltAndHashPassword } from "@/lib/password";

export async function GET() {
  try {
    await connectDB();

    // Define the initial admins here
    // You can change these emails and passwords to whatever you want before running
    const adminsToSeed = [
      {
        name: "Main Admin",
        email: "admin@mindamo.com",
        password: "adminPassword123!", // Change this!
        role: "super_admin",
      },
      {
        name: "Support Admin",
        email: "support@mindamo.com",
        password: "supportPassword123!",
        role: "admin",
      },
    ];

    const results = [];

    for (const adminData of adminsToSeed) {
      // 1. Check if exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        results.push(`Skipped ${adminData.email} - Already exists`);
        continue;
      }

      // 2. Hash the password securely
      const hashedPassword = await saltAndHashPassword(adminData.password);

      // 3. Create the Admin
      // We set 'mustChangePassword' to true so the UI prompts them to reset it immediately
      await Admin.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        mustChangePassword: true, 
        image: "", // Empty for now, they can upload later or use Google
      });

      results.push(`Created ${adminData.email}`);
    }

    return NextResponse.json({
      message: "Seeding Complete",
      details: results,
      instruction: "Please delete this file (app/api/seed-admin/route.js) before deploying to production!",
    });

  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}