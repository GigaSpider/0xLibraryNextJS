import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "0xLibrary",
  description: "Ethereum Smart Contract Library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-black font-mono text-sm h-full m-0 flex flex-col">
        <Header />
        <main className="flex-1 w-full overflow-hidden">{children}</main>
        <ConvexClientProvider>
          <Footer />
        </ConvexClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
