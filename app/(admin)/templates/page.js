import { Suspense } from "react";
import connectDB from "@/lib/db";
import EmailTemplate from "@/lib/models/EmailTemplate";
import EmailTemplateEditor from "@/components/email/template-editor";
import { saveTemplateAction } from "@/lib/actions/template-actions"; // See File 53.1 below
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn, formatDateTime } from "@/lib/utils";

export default async function TemplatesPage({ searchParams }) {
  // Await searchParams (Next.js 15)
  const resolvedParams = await searchParams;
  const currentSlug = resolvedParams?.slug;

  // Fetch all templates
  const templates = await getTemplates();
  
  // Find active template if slug is present
  const activeTemplate = currentSlug 
    ? templates.find(t => t.slug === currentSlug) 
    : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Templates</h2>
        <p className="text-muted-foreground">
          Customize the HTML emails sent to users and experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* --- Left Column: Template List --- */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col h-full min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-base">System Emails</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-2 gap-1">
                {templates.map((template) => (
                  <Link 
                    key={template._id} 
                    href={`/templates?slug=${template.slug}`}
                  >
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-md transition-colors text-sm",
                      currentSlug === template.slug 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 opacity-70" />
                        <span className="font-medium">{template.name}</span>
                      </div>
                      {currentSlug === template.slug && <ChevronRight className="h-3 w-3" />}
                    </div>
                  </Link>
                ))}
                
                {templates.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Run the seed script to generate default templates.
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* --- Right Column: Editor --- */}
        <div className="md:col-span-8 lg:col-span-9 h-full min-h-0">
          {activeTemplate ? (
            <Card className="h-full border-none shadow-none bg-transparent">
               {/* We pass the plain object to Client Component */}
               <EmailTemplateEditor 
                 template={JSON.parse(JSON.stringify(activeTemplate))} 
                 onSave={saveTemplateAction}
               />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed bg-muted/20">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Select a Template</h3>
                <p className="text-sm">Choose an email type from the list to start editing.</p>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

// --- Data Fetcher ---
async function getTemplates() {
  await connectDB();
  // Return lean objects for performance
  return EmailTemplate.find({}).sort({ name: 1 }).lean();
}