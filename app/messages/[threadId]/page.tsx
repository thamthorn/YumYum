"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { use } from "react";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Factory,
  Home,
  CheckCheck,
  Check,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { ROUTES } from "@/data/MockData";

interface Message {
  id: string;
  senderId: string;
  senderType: "buyer" | "oem";
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: { name: string; type: string; url: string }[];
}

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "buyer-1",
    senderType: "buyer",
    content:
      "Hi! I'm interested in manufacturing custom t-shirts. Can you handle an MOQ of around 1,000 units?",
    timestamp: "2024-10-12 10:30 AM",
    read: true,
  },
  {
    id: "2",
    senderId: "oem-1",
    senderType: "oem",
    content:
      "Hello! Yes, absolutely. We specialize in custom garments with MOQ starting from 1,000 units. What's your timeline?",
    timestamp: "2024-10-12 11:15 AM",
    read: true,
  },
  {
    id: "3",
    senderId: "buyer-1",
    senderType: "buyer",
    content:
      "That's great! I'm looking to have them ready by early December. Could you also provide samples first?",
    timestamp: "2024-10-12 02:45 PM",
    read: true,
    attachments: [
      { name: "design-reference.jpg", type: "image", url: "#" },
      { name: "tech-specs.pdf", type: "pdf", url: "#" },
    ],
  },
  {
    id: "4",
    senderId: "oem-1",
    senderType: "oem",
    content:
      "We can definitely meet your MOQ requirements. Let me send you a detailed quote. For samples, we typically need 7-10 days and charge $50 per sample (refundable with order).",
    timestamp: "2024-10-14 09:20 AM",
    read: false,
  },
];

const mockOEM = {
  id: 1,
  name: "Premium Fashion Co.",
  scale: "Large" as const,
  verified: "Trusted Partner",
};

function ThreadClient({ params }: { params: Promise<{ threadId: string }> }) {
  // Resolve the route params to keep Suspense semantics; threadId not used in mock UI
  use(params);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    // TODO: API call here
    setNewMessage("");
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        (file.type.startsWith("image/") || file.type === "application/pdf") &&
        file.size <= 10 * 1024 * 1024
    );
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        <section className="pt-20 pb-4 flex-1 flex flex-col">
          <div className="container mx-auto max-w-4xl flex-1 flex flex-col">
            {/* Header */}
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.messages}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>

                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {mockOEM.scale === "Large" ? (
                      <Factory className="h-5 w-5 text-primary" />
                    ) : (
                      <Home className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{mockOEM.name}</h2>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {mockOEM.scale}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {mockOEM.verified}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.oemProfile(mockOEM.id)}>View Profile</Link>
                </Button>
              </div>
            </Card>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === "buyer"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.senderType === "buyer"
                        ? "bg-primary text-white"
                        : "bg-card border"
                    } rounded-2xl p-4`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 p-2 rounded ${
                              message.senderType === "buyer"
                                ? "bg-white/10"
                                : "bg-muted"
                            }`}
                          >
                            {attachment.type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-xs">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span
                        className={`text-xs ${
                          message.senderType === "buyer"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </span>
                      {message.senderType === "buyer" && (
                        <div>
                          {message.read ? (
                            <CheckCheck className="h-3 w-3 text-white/70" />
                          ) : (
                            <Check className="h-3 w-3 text-white/70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <Card className="p-4">
              {/* Show selected attachments */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <Badge key={idx} variant="secondary" className="pr-1">
                      <span className="text-xs truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  title="Attach files (images/PDF up to 10MB)"
                  className="cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-[60px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  className="cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift+Enter for new line • Max 10MB per
                file
              </p>
            </Card>
          </div>
        </section>
      </div>
    </ProtectedClient>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ThreadClient params={params} />
    </Suspense>
  );
}
