import { Suspense } from "react";
import connectDB from "@/lib/db";
import Newsletter from "@/lib/models/Newsletter";
import { NewsletterComposer } from "@/components/admin/newsletter-composer"; // See 54.1
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Megaphone, History, Users } from "lucide-react";

export default async function NewsletterPage() {
  const history = await getNewsletterHistory();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Newsletter & Broadcasts</h2>
        <p className="text-muted-foreground">
          Send announcements to specific user groups or the entire platform.
        </p>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose" className="gap-2">
            <Megaphone className="h-4 w-4" /> Compose
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Sent History
          </TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Compose --- */}
        <TabsContent value="compose">
          <div className="grid gap-6">
            <NewsletterComposer />
          </div>
        </TabsContent>

        {/* --- Tab 2: History --- */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast History</CardTitle>
              <CardDescription>
                A log of all newsletters sent from this portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No newsletters sent yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item._id.toString()}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.targetAudience}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(item.sentAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {item.recipientCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="success">Sent</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getNewsletterHistory() {
  await connectDB();
  return Newsletter.find({ status: "sent" })
    .sort({ sentAt: -1 })
    .limit(20)
    .lean();
}