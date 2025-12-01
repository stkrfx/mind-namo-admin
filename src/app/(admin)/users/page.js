import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Expert from "@/lib/models/Expert";
import { manageEntityStatus } from "@/lib/actions/admin-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Ban, CheckCircle, EyeOff, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn, formatDateTime } from "@/lib/utils";

export default async function UsersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams?.tab || "experts"; // Default to experts as they need more management
  const query = resolvedSearchParams?.q || "";

  // Fetch Data based on Tab and Query
  const { data, total } = await getData(tab, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage permissions, verification, and bans.
          </p>
        </div>
        
        {/* Search Bar (Server Side Navigation) */}
        <form className="flex w-full max-w-sm items-center space-x-2">
          <Input 
            name="q" 
            placeholder="Search by name, email, or username..." 
            defaultValue={query}
          />
          <input type="hidden" name="tab" value={tab} />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <Link
          href={`/users?tab=experts&q=${query}`}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2 hover:bg-muted/50",
            tab === "experts" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          )}
        >
          Experts
        </Link>
        <Link
          href={`/users?tab=users&q=${query}`}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2 hover:bg-muted/50",
            tab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
          )}
        >
          Users
        </Link>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>{tab === "experts" ? "Expert List" : "User List"}</CardTitle>
          <CardDescription>Found {total} records matching your search.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item._id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={item.image} />
                        <AvatarFallback>{item.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">@{item.username}</div>
                        {item.hasPendingUpdate && (
                            <Badge variant="warning" className="mt-1 text-[10px] px-1 py-0">
                                Updates Pending
                            </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">{item.email}</div>
                    <div className="text-xs text-muted-foreground">{item.mobile || "No Mobile"}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                        {/* Ban Status */}
                        {item.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                        ) : (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                        )}

                        {/* Expert Specific Status */}
                        {tab === "experts" && (
                            <>
                                {item.verificationStatus === "verified" ? (
                                    <Badge variant="secondary" className="text-blue-600 bg-blue-50">Verified</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                        {item.verificationStatus}
                                    </Badge>
                                )}
                                {!item.isListed && !item.isBanned && (
                                    <Badge variant="secondary" className="text-gray-500">Unlisted</Badge>
                                )}
                            </>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt).split(",")[0]}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Action Forms */}
                      
                      {/* 1. Ban / Unban */}
                      <form action={manageEntityStatus}>
                        <input type="hidden" name="id" value={item._id.toString()} />
                        <input type="hidden" name="type" value={tab === "experts" ? "expert" : "user"} />
                        <input type="hidden" name="action" value={item.isBanned ? "unban" : "ban"} />
                        <Button 
                            variant={item.isBanned ? "outline" : "ghost"} 
                            size="icon" 
                            className={item.isBanned ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                            title={item.isBanned ? "Unban Account" : "Ban Account"}
                        >
                            {item.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </form>

                      {/* 2. List / Unlist (Experts Only) */}
                      {tab === "experts" && !item.isBanned && (
                        <form action={manageEntityStatus}>
                            <input type="hidden" name="id" value={item._id.toString()} />
                            <input type="hidden" name="type" value="expert" />
                            <input type="hidden" name="action" value={item.isListed ? "unlist" : "relist"} />
                            <Button 
                                variant="ghost" 
                                size="icon"
                                title={item.isListed ? "Unlist (Hide from users)" : "Relist (Show to users)"}
                            >
                                {item.isListed ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                            </Button>
                        </form>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {data.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
                No results found for "{query}".
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Data Fetching Helper ---
async function getData(tab, query) {
  await connectDB();
  
  const Model = tab === "experts" ? Expert : User;
  
  // Build Regex Query
  const searchRegex = query ? {
    $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { mobile: { $regex: query, $options: "i" } },
    ]
  } : {};

  const data = await Model.find(searchRegex)
    .sort({ createdAt: -1 })
    .limit(50) // Limit for performance, in real app implement pagination
    .lean();
  
  const total = await Model.countDocuments(searchRegex);

  return { data, total };
}