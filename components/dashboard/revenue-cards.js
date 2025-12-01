import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase,
  PiggyBank,
  Wallet
} from "lucide-react";

export function RevenueCards({ stats }) {
  // Destructure with defaults to prevent crashes if data is missing
  const {
    totalRevenue = 0,
    totalAdminShare = 0,
    totalExpertShare = 0,
    totalOrgShare = 0,
    totalGst = 0,
    todayRevenue = 0,
    lastWeekRevenue = 0,
  } = stats || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Platform Revenue (Gross) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gross Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            All time gross transaction volume
          </p>
        </CardContent>
      </Card>

      {/* 2. Admin Net Profit */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Net Earnings</CardTitle>
          <PiggyBank className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatPrice(totalAdminShare)}</div>
          <p className="text-xs text-muted-foreground">
            Your actual cut from transactions
          </p>
        </CardContent>
      </Card>

      {/* 3. Recent Performance (Today) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(todayRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Last Week: {formatPrice(lastWeekRevenue)}
          </p>
        </CardContent>
      </Card>

      {/* 4. GST Liability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GST Collected</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(totalGst)}</div>
          <p className="text-xs text-muted-foreground">
            Tax amount to be filed
          </p>
        </CardContent>
      </Card>

      {/* --- Second Row: Distributions --- */}

      {/* 5. Expert Payouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expert Payouts</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(totalExpertShare)}</div>
          <p className="text-xs text-muted-foreground">
            Distributed to independent experts
          </p>
        </CardContent>
      </Card>

      {/* 6. Organisation Payouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organisation Payouts</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(totalOrgShare)}</div>
          <p className="text-xs text-muted-foreground">
            Distributed to firms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}