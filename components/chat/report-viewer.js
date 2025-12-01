"use client";

import React from "react";
import { formatDateTime } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Ban, Play, FileText } from "lucide-react";
import { resolveReport } from "@/lib/actions/chat-actions"; 
import { manageEntityStatus } from "@/lib/actions/admin-actions";
import { toast } from "@/components/ui/use-toast";

export default function ReportViewer({ reportData }) {
  const { report, chatHistory } = reportData || {};

  if (!report) return <div className="p-4 text-center">Select a report to view details.</div>;

  const handleResolve = async () => {
    const res = await resolveReport(report._id, "resolved");
    if (res.success) {
      toast({ title: "Report Resolved", variant: "success" });
      // In a real app, you'd trigger a router refresh or state update here
    }
  };

  const handleBanReported = async () => {
    const formData = new FormData();
    formData.append("id", report.reportedId._id);
    formData.append("type", report.reportedModel.toLowerCase());
    formData.append("action", "ban");

    const res = await manageEntityStatus(formData);
    if (res.success) {
      toast({ title: "User Banned", description: "The reported account is now banned." });
      await resolveReport(report._id, "resolved"); // Auto-resolve report on ban
    } else {
      toast({ title: "Error", description: "Could not ban user.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* --- 1. Report Metadata Card --- */}
      <Card className="border-l-4 border-l-destructive shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Report: {report.category.replace("_", " ").toUpperCase()}
              </CardTitle>
              <CardDescription>
                Reported on {formatDateTime(report.createdAt)}
              </CardDescription>
            </div>
            <Badge variant={report.status === "pending" ? "destructive" : "success"}>
              {report.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Reporter */}
            <div className="p-3 bg-secondary/20 rounded-lg">
              <span className="text-xs font-bold text-muted-foreground uppercase">Reporter</span>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={report.reporterId.image} />
                  <AvatarFallback>R</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{report.reporterId.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{report.reporterId.email}</p>
                </div>
              </div>
            </div>

            {/* Accused */}
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <span className="text-xs font-bold text-destructive uppercase">Reported User</span>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={report.reportedId.image} />
                  <AvatarFallback>X</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{report.reportedId.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{report.reportedId.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
             <span className="text-xs font-bold text-muted-foreground">DESCRIPTION:</span>
             <p className="text-sm mt-1 p-2 bg-secondary rounded-md italic">
               "{report.description || "No additional description provided."}"
             </p>
          </div>
        </CardContent>
      </Card>

      {/* --- 2. Evidence: Chat History --- */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="py-3 border-b bg-muted/20">
          <CardTitle className="text-base font-medium">Evidence Log (Chat History)</CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
          <div className="space-y-4">
            {chatHistory && chatHistory.length > 0 ? (
              chatHistory.map((msg, idx) => {
                const isReportedUser = msg.senderId === report.reportedId._id;
                
                return (
                  <div 
                    key={msg._id || idx} 
                    className={`flex flex-col ${isReportedUser ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${isReportedUser ? "text-destructive" : "text-muted-foreground"}`}>
                        {isReportedUser ? report.reportedId.name : report.reporterId.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(msg.createdAt)}
                      </span>
                    </div>

                    <div 
                      className={`max-w-[80%] p-3 rounded-lg text-sm border 
                        ${isReportedUser ? "bg-white border-destructive/20" : "bg-blue-50 border-blue-100"}
                        ${msg.isDeleted ? "opacity-50 border-dashed" : ""}
                      `}
                    >
                       {/* Deleted Indicator */}
                       {msg.isDeleted && (
                         <span className="block text-[10px] text-destructive font-bold uppercase mb-1">
                           [Deleted Message]
                         </span>
                       )}

                       {/* Content */}
                       {msg.fileUrl ? (
                          msg.fileType === "image" ? (
                            <div className="relative">
                              <img src={msg.fileUrl} alt="evidence" className="max-h-48 rounded object-cover" />
                            </div>
                          ) : msg.fileType === "audio" ? (
                             <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                               <Play className="h-4 w-4" />
                               <span className="text-xs">Audio Evidence</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-2">
                               <FileText className="h-4 w-4" />
                               <span className="text-xs underline">Attachment</span>
                             </div>
                          )
                       ) : (
                         <p>{msg.message}</p>
                       )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-10">
                No chat history found linked to this report ID.
              </div>
            )}
          </div>
        </ScrollArea>

        <CardFooter className="py-4 border-t flex justify-end gap-2 bg-card">
          <Button variant="outline" onClick={() => handleResolve()}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Resolved (No Action)
          </Button>
          <Button variant="destructive" onClick={() => handleBanReported()}>
            <Ban className="mr-2 h-4 w-4" />
            Ban {report.reportedId.name}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}