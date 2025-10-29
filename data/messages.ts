import type { MessageThread } from "./types";

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: "1",
    oemId: 1,
    oemName: "Premium Fashion Co.",
    oemScale: "Large",
    lastMessage:
      "We can definitely meet your MOQ requirements. Let me send you a detailed quote.",
    timestamp: "2 hours ago",
    unread: true,
    read: false,
  },
  {
    id: "2",
    oemId: 6,
    oemName: "Bangkok Beauty Labs",
    oemScale: "Large",
    lastMessage:
      "Thank you for your interest! When would be a good time to discuss your project?",
    timestamp: "1 day ago",
    unread: false,
    read: true,
  },
  {
    id: "3",
    oemId: 3,
    oemName: "Swift Fashion Studio",
    oemScale: "Small",
    lastMessage:
      "The samples are ready for shipping. Would you like photos first?",
    timestamp: "3 days ago",
    unread: false,
    read: true,
  },
  {
    id: "4",
    oemId: 4,
    oemName: "Food Innovation Labs",
    oemScale: "Large",
    lastMessage: "I've attached our certification documents for your review.",
    timestamp: "5 days ago",
    unread: false,
    read: true,
  },
];
