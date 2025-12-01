import { Suspense } from "react";
import { getDashboardStats } from "@/lib/actions/admin-actions";
import { getReports } from "@/lib/actions/chat-actions"; // Reusing this action
import { RevenueCards } from "@/components/dashboard/revenue-cards";
import { PendingSettlements } from "@/components/dashboard/pending-settlements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of platform revenue, settlements, and safety alerts.
        </p>
      </div>

      {/* 1. Financial Overview (Revenue & Pending) */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* 2. Safety & Moderation (Reports) */}
      <Suspense fallback={<ReportsSkeleton />}>
        <RecentReportsSection />
      </Suspense>
    </div>
  );
}

// --- Async Component 1: Financial Stats ---
async function StatsSection() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-4">
      {/* Top Row: Revenue Breakdown */}
      <RevenueCards stats={stats.revenue} />
      
      {/* Second Row: Actionable Pending Items */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Settlements takes up 3 columns */}
        <div className="col-span-4">
          <PendingSettlements pending={stats.pending} />
        </div>
        
        {/* Quick Actions / Status Card takes up 3 columns */}
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Operational status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="success">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Socket Server</span>
                        <Badge variant="success">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Email Service</span>
                        <Badge variant="success">Active</Badge>
                    </div>
                     <div className="pt-4">
                        <Link href="/settings">
                            <Button variant="outline" className="w-full">System Settings</Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Async Component 2: Recent Reports ---
async function RecentReportsSection() {
  const reports = await getReports();
  // Take only the latest 5 for the dashboard
  const recentReports = reports.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Latest safety alerts requiring review.</CardDescription>
        </div>
        <Link href="/reports">
          <Button variant="ghost" className="gap-2">
            View All Reports <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending reports. The platform is safe!
          </div>
        ) : (
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report._id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-full bg-destructive/10 p-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">
                      {report.reporterId?.name || "Unknown"} reported{" "}
                      <span className="font-bold">{report.reportedId?.name || "Unknown"}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reason: {report.category.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                </div>
                <Link href={`/reports?id=${report._id}`}>
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Loading Skeletons ---

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonWrapper key={i} isLoading={true} height={120} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-4"><SkeletonWrapper isLoading={true} height={300} /></div>
        <div className="col-span-3"><SkeletonWrapper isLoading={true} height={300} /></div>
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return <SkeletonWrapper isLoading={true} height={400} />;
}