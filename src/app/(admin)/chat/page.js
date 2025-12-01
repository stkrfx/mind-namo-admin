import { auth } from "@/auth";
import { getAdminConversations } from "@/lib/actions/chat-actions";
import AdminChatInterface from "@/components/chat/admin-chat-interface";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function ChatPage() {
  const session = await auth();
  
  // Security check: This should be caught by middleware, but safe to double check
  if (!session?.user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-6 text-center text-destructive">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            Unauthorized access.
        </Card>
      </div>
    );
  }

  // Fetch initial list of conversations server-side for SEO/Performance
  const conversations = await getAdminConversations();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Support Chat</h2>
        <p className="text-muted-foreground">
          Real-time messaging with users and experts.
        </p>
      </div>

      <div className="flex-1 overflow-hidden border rounded-lg bg-background shadow-sm">
        {/* We pass the server-fetched data to the Client Component.
           This allows the UI to render immediately with data, 
           while the socket takes over for live updates.
        */}
        <AdminChatInterface 
          initialConversations={JSON.parse(JSON.stringify(conversations))} // Serialize for Client Component
          adminUser={session.user}
          uploadEndpoint="/api/uploadthing"
        />
      </div>
    </div>
  );
}