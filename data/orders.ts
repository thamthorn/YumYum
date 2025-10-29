import type { Order } from "./types";

export const ORDERS: Order[] = [
  {
    id: "ord-1001",
    oemId: 1,
    oemName: "Premium Fashion Co.",
    buyerId: "buyer-001",
    status: "Manufacturing",
    timeline: {
      Signed: "2025-10-10T09:10:00Z",
      Preparation: "2025-10-11T13:30:00Z",
      Manufacturing: "2025-10-13T08:00:00Z",
    },
    items: [
      {
        sku: "TSH-001",
        name: "Custom T-Shirt - Premium Cotton",
        quantity: 1000,
        unitPrice: 85,
      },
      {
        sku: "PKG-001",
        name: "Custom Packaging Box",
        quantity: 1000,
        unitPrice: 12,
      },
      { sku: "LBL-001", name: "Woven Label", quantity: 1000, unitPrice: 3.5 },
    ],
    subtotal: 100500,
    shippingFee: 3500,
    tax: 7245,
    total: 111245,
    quantityTotal: 3000,
    shippingProvider: "Kerry Express",
    trackingNumber: "TH-KRY-12345678",
    estimatedDelivery: "2025-10-22T00:00:00Z",
    notes:
      "Prototype approved on Oct 8. Full production run started Oct 13. QC inspection scheduled for Oct 18.",
  },
  {
    id: "ord-1002",
    oemId: 3,
    oemName: "Swift Fashion Studio",
    buyerId: "buyer-001",
    status: "Preparation",
    timeline: {
      Signed: "2025-10-12T14:20:00Z",
      Preparation: "2025-10-13T10:00:00Z",
    },
    items: [
      {
        sku: "PROTO-BAG-001",
        name: "Prototype Tote Bag - Canvas",
        quantity: 50,
        unitPrice: 120,
      },
      {
        sku: "PROTO-BAG-002",
        name: "Prototype Crossbody - Leather",
        quantity: 30,
        unitPrice: 280,
      },
    ],
    subtotal: 15600,
    shippingFee: 0,
    tax: 1092,
    total: 16692,
    quantityTotal: 80,
    shippingProvider: "Thailand Post",
    trackingNumber: "TH-POST-87654321",
    estimatedDelivery: "2025-10-25T00:00:00Z",
  },
];
