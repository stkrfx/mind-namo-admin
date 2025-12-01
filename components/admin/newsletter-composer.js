"use client";

import { useState } from "react";
import { sendNewsletterAction } from "@/lib/actions/newsletter-actions"; // See 54.2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // (Or standard textarea if you prefer)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // You might need to add this UI component or use native select
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Send, Eye, Loader2 } from "lucide-react";

export function NewsletterComposer() {
  const [subject, setSubject] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [content, setContent] = useState("<h1>Hello World</h1><p>Write your update here...</p>");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !content) {
      toast({ title: "Validation Error", description: "Subject and Content are required.", variant: "destructive" });
      return;
    }

    if (!confirm(`Are you sure you want to send this to ${targetAudience.toUpperCase()} users?`)) {
        return;
    }

    setIsSending(true);
    const result = await sendNewsletterAction({ subject, targetAudience, content });
    setIsSending(false);

    if (result.success) {
      toast({ title: "Newsletter Sent", description: `Successfully broadcasted to ${result.count} recipients.`, variant: "success" });
      setSubject("");
      setContent("");
    } else {
      toast({ title: "Error", description: "Failed to send newsletter.", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* --- Left: Editor --- */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label>Target Audience</Label>
            {/* Native Select for simplicity if Shadcn Select isn't fully installed yet */}
            <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
            >
                <option value="all">All Users & Experts</option>
                <option value="users">Users Only</option>
                <option value="experts">Experts Only</option>
                <option value="organisations">Organisations Only</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Subject Line</Label>
            <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Important Update..." 
            />
          </div>

          <div className="space-y-2">
            <Label>HTML Content</Label>
            <textarea
              className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
                You can write raw HTML here. Use tags like &lt;h1&gt;, &lt;p&gt;, &lt;br&gt;.
            </p>
          </div>

          <Button className="w-full" onClick={handleSend} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Broadcast
          </Button>

        </CardContent>
      </Card>

      {/* --- Right: Preview --- */}
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 bg-white rounded-b-lg m-4 border p-4 overflow-auto text-black">
           {/* Sandbox Preview */}
           <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </CardContent>
      </Card>
    </div>
  );
}