import { Suspense } from "react";
import connectDB from "@/lib/db";
import Organisation from "@/lib/models/Organisation";
import Expert from "@/lib/models/Expert";
import Transaction from "@/lib/models/Transaction";
import { notFound } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin, Users, DollarSign, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function OrganisationProfilePage({ params }) {
  // Unwrap params (Next.js 15)
  const { id } = await params;

  // Fetch Data
  const data = await getOrganisationDetails(id);
  if (!data) return notFound();

  const { org, experts, stats } = data;

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 rounded-lg border-2 border-muted">
            <AvatarImage src={org.image} className="object-cover" />
            <AvatarFallback className="rounded-lg text-2xl">
              {org.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
              {org.isBanned && <Badge variant="destructive">Banned</Badge>}
              {org.verificationStatus === "verified" && <ShieldCheck className="h-5 w-5 text-blue-500" />}
            </div>
            <p className="text-muted-foreground">@{org.username}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {org.email}
              </span>
              {org.mobile && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {org.mobile}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
            {/* If they haven't logged in yet */}
            {org.requiresPasswordChange && (
                 <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-warning-foreground text-xs font-medium border border-warning/20">
                    <AlertTriangle className="h-3 w-3" />
                    Public Credentials Active (Unchanged)
                 </div>
            )}
            <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <Separator />

      {/* --- Statistics Cards --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Org Share: {formatPrice(stats.orgEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experts.length}</div>
            <p className="text-xs text-muted-foreground">
              Linked to this firm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {org.customCommissionPercentage ? `${org.customCommissionPercentage}%` : "Global Default"}
            </div>
            <p className="text-xs text-muted-foreground">
              Applied to future transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Details & Experts Grid --- */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left: About */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>About Firm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Description</span>
                <p className="text-sm mt-1">{org.description || "No description provided."}</p>
             </div>
             <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Address</span>
                <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{org.address || "No address listed."}</p>
                </div>
             </div>
             <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Joined</span>
                <p className="text-sm mt-1">{formatDateTime(org.createdAt)}</p>
             </div>
          </CardContent>
        </Card>

        {/* Right: Linked Experts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Associated Experts</CardTitle>
            <CardDescription>
                Experts working under {org.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Expert Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {experts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                No experts linked yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        experts.map(expert => (
                            <TableRow key={expert._id.toString()}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={expert.image} />
                                            <AvatarFallback>{expert.name[0]}</AvatarFallback>
                                        </Avatar>
                                        {expert.name}
                                    </div>
                                </TableCell>
                                <TableCell>{expert.specialization?.join(", ") || "N/A"}</TableCell>
                                <TableCell>
                                    <Badge variant={expert.isBanned ? "destructive" : "outline"}>
                                        {expert.isBanned ? "Banned" : "Active"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Data Fetching ---
async function getOrganisationDetails(id) {
  try {
    await connectDB();
    
    // 1. Fetch Org
    const org = await Organisation.findById(id).lean();
    if (!org) return null;

    // 2. Fetch Experts
    const experts = await Expert.find({ organisationId: id }).select("name image specialization isBanned").lean();

    // 3. Fetch Financials (Aggregate)
    const stats = await Transaction.aggregate([
        { $match: { organisationId: org._id, status: "completed" } },
        { 
            $group: { 
                _id: null, 
                totalRevenue: { $sum: "$amount" },
                orgEarnings: { $sum: "$orgShare" }
            } 
        }
    ]);

    return {
        org,
        experts,
        stats: stats[0] || { totalRevenue: 0, orgEarnings: 0 }
    };

  } catch (error) {
    console.error("Error fetching org details:", error);
    return null;
  }
}