import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  FileCheck, 
  RefreshCcw 
} from "lucide-react";
import Link from "next/link";

export function PendingSettlements({ pending }) {
  const {
    totalPendingAmount = 0,
    unattendedCount = 0,
    refundPendingCount = 0,
    // You can extend the API to return count of 'under_review' specifically if needed
  } = pending || {};

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Settlement & Actions</CardTitle>
        <CardDescription>
          Overview of funds held in escrow awaiting verification or action.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Top Banner: Total Floating Money */}
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total Uncleared Funds
            </p>
            <p className="text-2xl font-bold">{formatPrice(totalPendingAmount)}</p>
          </div>
          <Clock className="h-8 w-8 text-muted-foreground opacity-20" />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Requires Attention
          </h4>

          {/* 1. Unattended Appointments (High Priority) */}
          <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Unattended Appointments</p>
                <p className="text-xs text-muted-foreground">
                  Experts missed the scheduled time.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{unattendedCount}</span>
              {unattendedCount > 0 && (
                <Link href="/transactions?status=unattended">
                    <Badge variant="destructive" className="cursor-pointer">Resolve</Badge>
                </Link>
              )}
            </div>
          </div>

          {/* 2. Cancelled Pending Refund */}
          <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/10">
                <RefreshCcw className="h-5 w-5 text-warning-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Refund Approvals</p>
                <p className="text-xs text-muted-foreground">
                  User cancelled, verify before refunding.
                </p>
              </div>
            </div>
             <div className="flex items-center gap-2">
              <span className="font-bold">{refundPendingCount}</span>
              {refundPendingCount > 0 && (
                <Link href="/transactions?status=cancelled_pending_refund">
                    <Badge variant="warning" className="cursor-pointer">Review</Badge>
                </Link>
              )}
            </div>
          </div>

          {/* 3. Under Review (General) */}
          <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Pending Verification</p>
                <p className="text-xs text-muted-foreground">
                  Awaiting OTP or completion check.
                </p>
              </div>
            </div>
            <Link href="/transactions?status=under_review">
                <Badge variant="outline" className="cursor-pointer">View All</Badge>
            </Link>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}