import { Suspense } from "react";
import connectDB from "@/lib/db";
import Organisation from "@/lib/models/Organisation";
import { CreateOrgDialog } from "@/components/admin/create-org-dialog"; // See File 50.1 below
import { manageEntityStatus } from "@/lib/actions/admin-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Ban, CheckCircle, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function OrganisationsPage() {
  const { data: organisations } = await getOrganisations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organisations</h2>
          <p className="text-muted-foreground">
            Manage firms and their public access credentials.
          </p>
        </div>
        {/* Create Button Wrapper */}
        <CreateOrgDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Firms</CardTitle>
          <CardDescription>
            List of all organisations collaborating with the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Credentials Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organisations.map((org) => (
                <TableRow key={org._id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md border">
                        <AvatarImage src={org.image} />
                        <AvatarFallback className="rounded-md">
                          <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground">@{org.username}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {org.email}
                      </div>
                      {org.requiresPasswordChange && (
                        <Badge variant="warning" className="w-fit text-[10px] px-1 py-0">
                          Pending Password Setup
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {org.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(org.createdAt).split(",")[0]}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* View Profile Button */}
                      <Link href={`/organisations/${org._id}`}>
                        <Button variant="ghost" size="icon" title="View Profile">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* Ban/Unban Form */}
                      <form action={manageEntityStatus}>
                        <input type="hidden" name="id" value={org._id.toString()} />
                        <input type="hidden" name="type" value="organisation" />
                        <input type="hidden" name="action" value={org.isBanned ? "unban" : "ban"} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className={org.isBanned ? "text-green-600" : "text-destructive"}
                          title={org.isBanned ? "Unban" : "Ban"}
                        >
                          {org.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {organisations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No organisations found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Data Fetcher ---
async function getOrganisations() {
  await connectDB();
  const data = await Organisation.find({})
    .sort({ createdAt: -1 })
    .lean();
  return { data };
}