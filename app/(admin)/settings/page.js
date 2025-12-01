import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import GlobalSettings from "@/lib/models/GlobalSettings";
import { SettingsForms } from "@/components/admin/settings-forms"; // See File 52.1 below
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch Data Parallelly
  const [adminData, settingsData] = await Promise.all([
    getAdminProfile(session.user.email),
    getGlobalSettings()
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile and global platform configurations.
        </p>
      </div>

      {/* We pass the plain JS objects to the Client Component.
        The Client Component handles the tabs and form submissions.
      */}
      <SettingsForms 
        admin={JSON.parse(JSON.stringify(adminData))} 
        settings={JSON.parse(JSON.stringify(settingsData))} 
      />
    </div>
  );
}

// --- Data Fetchers ---

async function getAdminProfile(email) {
  await connectDB();
  return Admin.findOne({ email }).select("name email image").lean();
}

async function getGlobalSettings() {
  await connectDB();
  // Fetch the singleton settings document, or return default structure if none exists
  let settings = await GlobalSettings.findOne({}).lean();
  
  if (!settings) {
    settings = {
      commissionType: "percentage",
      adminPercentage: 10,
      adminFixedFee: 0,
      thresholdAmount: 1000,
      highValueFixedFee: 50
    };
  }
  return settings;
}