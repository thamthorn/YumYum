"use client";

import { Suspense } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  CheckCheck,
  Check,
  Factory,
  Home,
} from "lucide-react";
import { MESSAGE_THREADS, ROUTES, COPY } from "@/data/MockData";

export default function Messages() {
  const mockThreads = MESSAGE_THREADS;
  const unreadCount = mockThreads.filter((t) => t.unread).length;

  return (
    <Suspense fallback={null}>
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />

          <section className="pt-32 pb-20">
            <div className="container mx-auto max-w-5xl">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold">
                    {COPY.pages.messages.title}
                  </h1>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary">{unreadCount} new</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {COPY.pages.messages.subtitle}
                </p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={COPY.pages.messages.search}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Thread List */}
              <div className="space-y-3">
                {mockThreads.map((thread) => (
                  <Link key={thread.id} href={ROUTES.messageThread(thread.id)}>
                    <Card
                      className={`p-5 hover:shadow-md transition-all cursor-pointer mb-2 ${
                        thread.unread ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* OEM Icon */}
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            {thread.oemScale === "Large" ? (
                              <Factory className="h-6 w-6 text-primary" />
                            ) : (
                              <Home className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3
                                className={`font-semibold ${
                                  thread.unread
                                    ? "text-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {thread.oemName}
                              </h3>
                              <Badge variant="outline" className="text-xs mt-1">
                                {thread.oemScale} Scale
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {thread.timestamp}
                              </span>
                              {thread.read ? (
                                <CheckCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Check className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-sm truncate ${
                              thread.unread
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {thread.lastMessage}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {mockThreads.length === 0 && (
                <Card className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {COPY.pages.messages.emptyTitle}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {COPY.pages.messages.emptySubtitle}
                  </p>
                  <Link
                    href={ROUTES.oems}
                    className="text-primary hover:underline"
                  >
                    {COPY.pages.messages.browseOEMs}
                  </Link>
                </Card>
              )}
            </div>
          </section>
        </div>
      </ProtectedClient>
    </Suspense>
  );
}
