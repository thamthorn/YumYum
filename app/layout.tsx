import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yum-yum-pi.vercel.app'),
  // 1. Title: PURE KEYWORDS. No brand name.
  // This tells Google: "This site IS the direcyum-yum-pi.vercel.apptory."
  title: {
    default: "Find OEM Manufacturers Thailand | Food, Beauty & Wellness Factory List",
    template: "%s | Thailand OEM Directory", // Internal pages will look like "About Us | Thailand OEM Directory"
  },

  // 2. Description: Focus on the RESULT, not the platform name.
  description:
    "Search verified Thai OEM factories for Food, Supplements, and Cosmetics. Filter by Low MOQ, GMP/HACCP standards, and price. Connect directly with manufacturers. Matching with OEM.",

  // 3. Keywords: Remove "Yum2", keep the high-traffic terms.
  keywords: [
    // High Volume English
    "OEM Thailand",
    "Find OEM",
    "OEM Matching",
    "Contract Manufacturing",
    "Start a food business",
    "Paiboon Products",
    "YumYum",
    "Thailand Factory Directory",
    "Food Manufacturer List",
    "Supplement OEM Low MOQ",
    "Cosmetic Factory Thailand",
    // High Volume Thai
    "รวมรายชื่อโรงงานผลิต", // Collection of factory names
    "รับผลิตอาหารเสริม",   // Supplement OEM
    "โรงงานผลิตครีม",     // Cream Factory
    "สร้างแบรนด์ตัวเอง",   // Build my own brand
    "หาโรงงานผลิตสินค้า",  // Find product factory
    "OEM อาหาร",         // Food OEM
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          {/* Toasts */}
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
