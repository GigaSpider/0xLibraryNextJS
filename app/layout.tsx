import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "XMR/ETH Swap",
  description: "Decentralized Smart Contract Protocol for Monero",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body className="bg-black font-mono text-sm">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
