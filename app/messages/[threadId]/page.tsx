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
  Zap,
} from "lucide-react";
import { ROUTES } from "@/data/MockData";
import { toast } from "sonner";

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

// Quick reply templates for buyers
const QUICK_REPLY_TEMPLATES = [
  {
    id: "1",
    label: "Request Quote",
    message: "Could you please send me a detailed quote for this order?",
    autoReply:
      "Thank you for your interest! I'll prepare a detailed quote including pricing, MOQ, and production timeline. You can expect it within the next 2-4 hours. In the meantime, please feel free to share any specific requirements or questions.",
  },
  {
    id: "2",
    label: "Ask Timeline",
    message: "What's the estimated production and delivery timeline?",
    autoReply:
      "Our typical production timeline is 15-30 days depending on order quantity and complexity. Shipping takes an additional 3-7 days for express or 30-45 days for sea freight. For your specific requirements, I can provide an exact timeline once I review your order details.",
  },
  {
    id: "3",
    label: "Request Sample",
    message:
      "Can I get a sample before placing the full order? What's the cost?",
    autoReply:
      "Yes, we offer samples! Sample cost is $50-100 per unit (refundable with your first order of 500+ units). Sample production takes 7-10 days plus shipping. Would you like me to send you our sample request form?",
  },
  {
    id: "4",
    label: "Confirm Order",
    message: "I'd like to proceed with this order. What are the next steps?",
    autoReply:
      "Excellent! Here are the next steps:\n\n1. Final quote confirmation\n2. 30% deposit payment\n3. Production begins (15-30 days)\n4. Quality inspection\n5. Balance payment & shipping\n\nI'll send you a detailed order confirmation with payment instructions. Do you have any questions about the process?",
  },
  {
    id: "5",
    label: "Payment Terms",
    message: "What are your payment terms and accepted payment methods?",
    autoReply:
      "Our standard payment terms:\n- 30% deposit before production\n- 70% balance before shipping\n\nAccepted methods: Bank transfer, PayPal, Credit card, or Escrow service (recommended for first orders).\n\nFor established partners, we offer NET-30 terms. Which payment method works best for you?",
  },
  {
    id: "6",
    label: "Customize Product",
    message:
      "Can this product be customized? What customization options are available?",
    autoReply:
      "Yes, we specialize in customization! Available options:\n\n✓ Custom colors & materials\n✓ Logo printing/embroidery\n✓ Custom packaging\n✓ Size modifications\n✓ Design adjustments\n\nPlease share your design files or requirements, and I'll confirm feasibility and provide pricing.",
  },
];

function ThreadClient({ params }: { params: Promise<{ threadId: string }> }) {
  // Resolve the route params to keep Suspense semantics; threadId not used in mock UI
  use(params);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    // Create new message
    const newMsg: Message = {
      id: String(messages.length + 1),
      senderId: "buyer-1",
      senderType: "buyer",
      content: newMessage,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setAttachments([]);
    setShowQuickReplies(false); // Hide quick replies after first message

    // Scroll to bottom
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleQuickReply = (templateMessage: string, autoReplyText: string) => {
    // Create buyer's message with quick reply template
    const buyerMsg: Message = {
      id: String(messages.length + 1),
      senderId: "buyer-1",
      senderType: "buyer",
      content: templateMessage,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      read: false,
    };

    setMessages((prev) => [...prev, buyerMsg]);
    setShowQuickReplies(false);

    toast.success("Message sent!", {
      icon: <Send className="h-4 w-4" />,
    });

    // Scroll to bottom
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // Auto-reply from OEM after 1.5 seconds
    setTimeout(() => {
      const oemReply: Message = {
        id: String(messages.length + 2),
        senderId: "oem-1",
        senderType: "oem",
        content: autoReplyText,
        timestamp: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        read: false,
      };

      setMessages((prev) => [...prev, oemReply]);

      toast.info("New message from OEM", {
        description: "Premium Fashion Co. replied to your message",
      });

      // Scroll to bottom after OEM reply
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 1500); // 1.5 second delay for realistic feel
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
              {messages.map((message) => (
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

            {/* Quick Reply Templates */}
            {showQuickReplies && (
              <Card className="p-4 mb-4 bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Quick Replies</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplies(false)}
                    className="ml-auto h-6 text-xs"
                  >
                    Hide
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {QUICK_REPLY_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuickReply(template.message, template.autoReply)
                      }
                      className="justify-start text-left h-auto py-2 px-3 hover:bg-primary/10 hover:border-primary"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs">{template.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

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
                  aria-label="Upload files"
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

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send • Shift+Enter for new line • Max 10MB per
                  file
                </p>
                {!showQuickReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplies(true)}
                    className="h-6 text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Show Quick Replies
                  </Button>
                )}
              </div>
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
