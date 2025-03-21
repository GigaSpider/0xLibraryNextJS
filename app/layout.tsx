import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Monero DEX",
  description: "A community driven exchange for Monero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body className="bg-black font-mono text-sm">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
