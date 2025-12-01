import { Suspense } from "react";
import { getReports, getReportDetails } from "@/lib/actions/chat-actions";
import ReportViewer from "@/components/chat/report-viewer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime, cn } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Search } from "lucide-react";
import SkeletonWrapper from "@/components/ui/skeleton-wrapper";

export default async function ReportsPage({ searchParams }) {
  // Await searchParams in Next.js 15+ 
  const resolvedSearchParams = await searchParams;
  const selectedId = resolvedSearchParams?.id;

  // Parallel data fetching could be done here, but usually we need the list first
  const reports = await getReports();

  // If an ID is selected, fetch the full details including chat history
  let selectedReportData = null;
  if (selectedId) {
    selectedReportData = await getReportDetails(selectedId);
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Safety Reports</h2>
          <p className="text-muted-foreground">
            Manage user reports and review flagged chat history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* --- Left Col: Report List --- */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col h-full min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-lg">Inbox</CardTitle>
              <CardDescription>
                {reports.length} {reports.length === 1 ? 'report' : 'reports'} found
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
                  No pending reports.
                </div>
              ) : (
                <div className="divide-y">
                  {reports.map((report) => {
                    const isSelected = selectedId === report._id.toString();
                    return (
                      <Link 
                        key={report._id} 
                        href={`/reports?id=${report._id}`}
                        className={cn(
                          "block p-4 transition-colors hover:bg-muted/50",
                          isSelected ? "bg-muted border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-[10px] px-1 py-0 h-5">
                            {report.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateTime(report.createdAt).split(",")[0]}
                          </span>
                        </div>
                        
                        <div className="font-medium text-sm truncate">
                          {report.category.replace("_", " ").toUpperCase()}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                           <Avatar className="h-6 w-6">
                              <AvatarImage src={report.reporterId?.image} />
                              <AvatarFallback>R</AvatarFallback>
                           </Avatar>
                           <span className="text-xs text-muted-foreground">reported</span>
                           <Avatar className="h-6 w-6">
                              <AvatarImage src={report.reportedId?.image} />
                              <AvatarFallback>X</AvatarFallback>
                           </Avatar>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- Right Col: Report Details & Evidence --- */}
        <div className="md:col-span-8 lg:col-span-9 h-full min-h-0">
           {selectedId ? (
              <Suspense fallback={<SkeletonWrapper isLoading={true} height="100%" />}>
                  <ReportViewer reportData={selectedReportData} />
              </Suspense>
           ) : (
             <Card className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 border-dashed">
                <div className="text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a report from the list to view evidence.</p>
                </div>
             </Card>
           )}
        </div>

      </div>
    </div>
  );
}