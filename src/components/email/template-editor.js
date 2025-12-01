"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Save, Copy, RefreshCw } from "lucide-react";

export default function EmailTemplateEditor({ template, onSave }) {
  const [subject, setSubject] = useState(template?.subject || "");
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || "");
  const [isSaving, setIsSaving] = useState(false);

  const availableVariables = template?.availableVariables || ["{{name}}", "{{email}}"];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...template,
        subject,
        htmlContent,
      });
      toast({ title: "Template Saved", variant: "success" });
    } catch (error) {
      toast({ title: "Error Saving", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const copyVariable = (v) => {
    navigator.clipboard.writeText(v);
    toast({ title: "Copied", description: `${v} copied to clipboard` });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-4">
      {/* --- Top Bar: Metadata --- */}
      <div className="flex items-end gap-4 p-1">
        <div className="flex-1 space-y-2">
          <Label>Email Subject Line</Label>
          <Input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="e.g. Welcome to MindAmo!"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="mb-0.5">
          {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Template
        </Button>
      </div>

      {/* --- Variables Toolbar --- */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 p-2 rounded-md">
        <span className="font-semibold">Available Variables:</span>
        {availableVariables.map((v) => (
          <Badge 
            key={v} 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => copyVariable(v)}
            title="Click to Copy"
          >
            {v} <Copy className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>

      {/* --- Split Editor --- */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        
        {/* Left: Code Editor */}
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">HTML Source Code</Label>
          <textarea
            className="flex-1 w-full p-4 font-mono text-sm border rounded-md resize-none bg-slate-950 text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">Live Preview</Label>
          <Card className="flex-1 overflow-hidden bg-white">
            <CardContent className="p-0 h-full">
              {/* Using iframe to sandbox CSS/Styles so they don't break the Admin UI */}
              <iframe
                title="preview"
                srcDoc={htmlContent}
                className="w-full h-full border-none"
                sandbox="allow-same-origin"
              />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}