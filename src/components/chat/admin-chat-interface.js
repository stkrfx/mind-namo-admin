"use client";

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUploadThing } from "@/lib/uploadthing"; // Custom hook helper (we might need to export this or use generateReactHelpers)
// Note: In standard setup, use the helper you generated or the package directly.
// For this snippet, I will implement the logic using the generic upload function.

import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreVertical, 
  Ban, 
  Trash2, 
  Image as ImageIcon,
  FileText,
  StopCircle,
  Play,
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/modal";
import { manageEntityStatus } from "@/lib/actions/admin-actions"; // Server action
import { formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton-wrapper";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast"; // Assuming you have a toast component

// --- Mocking UploadThing Helper for Client ---
import { generateReactHelpers } from "@uploadthing/react";
const { useUploadThing: useUpload } = generateReactHelpers();

export default function AdminChatInterface({ 
  initialConversations, 
  adminUser, 
  uploadEndpoint 
}) {
  // State
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  // Refs
  const scrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Derived
  const activeConversation = conversations.find(c => c.roomId === activeRoomId);
  const otherUser = activeConversation?.otherUser;

  // --- 1. Socket Connection ---
  useEffect(() => {
    // Connect to the separate Socket Server
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      query: { userId: adminUser.id, role: "admin" }
    });

    s.on("connect", () => {
      console.log("Connected to Socket Server");
    });

    // Listen for incoming messages
    s.on("receive_message", (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find(m => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      scrollToBottom();
    });

    setSocket(s);

    return () => s.disconnect();
  }, [adminUser.id]);

  // --- 2. Load Messages when Room Changes ---
  useEffect(() => {
    if (!activeRoomId) return;

    // Join the room via socket
    socket?.emit("join_room", activeRoomId);

    // Fetch history (Client-side fetch to your API or Server Action wrapper)
    // For this example, we assume a fetch function exists or we use a Server Action passed as prop
    // simplified:
    async function fetchHistory() {
      // fetch(`/api/chat/${activeRoomId}`) ...
      // setMessages(data)
    }
    fetchHistory();
    
    // Cleanup: Leave room
    return () => {
      socket?.emit("leave_room", activeRoomId);
    };
  }, [activeRoomId, socket]);

  // --- 3. Scroll Handling ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // --- 4. Send Message Logic ---
  const handleSendMessage = async (attachmentUrl = null, attachmentType = null) => {
    if ((!inputText.trim() && !attachmentUrl) || !activeRoomId) return;

    const tempId = Date.now().toString(); // Optimistic UI
    const payload = {
      roomId: activeRoomId,
      senderId: adminUser.id, // "admin" or ID
      receiverId: activeConversation.otherUser._id,
      message: inputText,
      fileUrl: attachmentUrl,
      fileType: attachmentType,
      createdAt: new Date(),
      _id: tempId, 
    };

    // 1. Optimistic Update
    setMessages((prev) => [...prev, payload]);
    setInputText("");
    scrollToBottom();

    // 2. Emit to Socket (for instant delivery to user)
    socket.emit("send_message", payload);

    // 3. Persist to DB (Call Server Action via API route usually, or directly if allowed)
    // await saveMessageToDB(payload); 
  };

  // --- 5. Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });
        
        // Upload
        handleFileUpload([audioFile], "audio");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({ title: "Microphone Access Denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- 6. File Upload Logic ---
  const { startUpload } = useUpload({
    endpoint: "chatAttachment",
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        // Determine type based on file extension/mime
        const file = res[0];
        const type = file.type.startsWith("image") ? "image" : file.type.startsWith("audio") ? "audio" : "pdf";
        handleSendMessage(file.url, type);
      }
    },
    onUploadError: () => {
      setIsUploading(false);
      toast({ title: "Upload Failed", variant: "destructive" });
    },
  });

  const handleFileUpload = (files, manualType) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    startUpload(files);
  };

  // --- 7. Ban Logic ---
  const handleBanUser = async () => {
    if (!otherUser) return;
    
    const formData = new FormData();
    formData.append("id", otherUser._id);
    formData.append("type", "user"); // Logic to detect if user/expert needed here
    formData.append("action", "ban");

    const result = await manageEntityStatus(formData);
    
    if (result.success) {
      toast({ title: "User Banned Successfully", variant: "success" });
      setShowBanModal(false);
    } else {
      toast({ title: "Failed to Ban", variant: "destructive" });
    }
  };


  return (
    <div className="grid grid-cols-12 h-[calc(100vh-4rem)] bg-background">
      
      {/* --- LEFT SIDEBAR: Conversation List --- */}
      <div className="col-span-3 border-r flex flex-col">
        <div className="p-4 border-b">
          <Input placeholder="Search messages..." className="bg-secondary/50" />
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.roomId}
              onClick={() => setActiveRoomId(conv.roomId)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                activeRoomId === conv.roomId ? "bg-accent" : ""
              }`}
            >
              <Avatar>
                <AvatarImage src={conv.otherUser.image} />
                <AvatarFallback>{conv.otherUser.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-medium truncate">{conv.otherUser.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(conv.lastMessageTime).split('at')[0]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage || "Sent an attachment"}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <Badge variant="default" className="ml-auto h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* --- RIGHT MAIN: Chat Window --- */}
      <div className="col-span-9 flex flex-col">
        {activeRoomId ? (
          <>
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser.image} />
                  <AvatarFallback>{otherUser.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold leading-none">{otherUser.name}</h3>
                  <p className="text-xs text-muted-foreground">{otherUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setShowBanModal(true)}
                  className="gap-2"
                >
                  <Ban className="h-4 w-4" />
                  Ban User
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-secondary/10">
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isAdmin = msg.senderId === adminUser.id || msg.senderId === "admin";
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                          msg.isDeleted ? "opacity-60 border-2 border-dashed border-destructive/30" : ""
                        } ${
                          isAdmin
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card text-card-foreground rounded-bl-none"
                        }`}
                      >
                        {msg.isDeleted && (
                          <span className="text-[10px] uppercase font-bold text-destructive mb-1 block">
                            (Deleted by User)
                          </span>
                        )}
                        
                        {/* Content Rendering */}
                        {msg.fileUrl ? (
                          msg.fileType === "image" ? (
                            <img src={msg.fileUrl} alt="attachment" className="rounded-lg max-h-60 object-cover" />
                          ) : msg.fileType === "audio" ? (
                             <div className="flex items-center gap-2 min-w-[200px]">
                               <Play className="h-4 w-4" />
                               <span className="text-xs">Voice Note</span>
                               <audio src={msg.fileUrl} controls className="h-8 w-40" />
                             </div>
                          ) : (
                            <a href={msg.fileUrl} target="_blank" className="flex items-center gap-2 underline">
                              <FileText className="h-4 w-4" />
                              View Attachment
                            </a>
                          )
                        ) : (
                           <p className="text-sm">{msg.message}</p>
                        )}
                        
                        <p className={`text-[10px] mt-1 text-right ${isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-card border-t">
              {isUploading && <div className="text-xs text-muted-foreground mb-2">Uploading attachment...</div>}
              
              <div className="flex items-end gap-2">
                {/* File Upload Trigger */}
                <Button variant="ghost" size="icon" className="mb-0.5" onClick={() => document.getElementById("file-upload").click()}>
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  multiple={false}
                  onChange={(e) => handleFileUpload(e.target.files)} 
                />

                {/* Text Input */}
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="pr-10 min-h-[2.5rem]"
                  />
                </div>

                {/* Action Button: Mic vs Send */}
                {inputText.length > 0 ? (
                  <Button onClick={() => handleSendMessage()} size="icon" className="shrink-0">
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    variant={isRecording ? "destructive" : "secondary"}
                    size="icon" 
                    className={`shrink-0 ${isRecording ? "animate-pulse" : ""}`}
                  >
                    {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* --- BAN MODAL --- */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Ban</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban <strong>{otherUser?.name}</strong>? 
              They will lose access to the platform immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanUser}>Confirm Ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}