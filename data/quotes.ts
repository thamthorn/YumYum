import type { QuoteRequest } from "./types";

export const QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 1,
    oem: "Premium Fashion Co.",
    product: "Custom Denim Jacket",
    quantity: 5000,
    status: "Quote Received",
    date: "2024-01-10",
    type: "quote",
  },
  {
    id: 2,
    oem: "Food Innovation Labs",
    product: "Organic Snack Bar",
    quantity: 500,
    status: "Pending Response",
    date: "2024-01-12",
    type: "prototype",
  },
  {
    id: 3,
    oem: "Swift Samples Studio",
    product: "Prototype Bags",
    quantity: 10,
    status: "In Production",
    date: "1 week ago",
    type: "prototype",
  },
];
