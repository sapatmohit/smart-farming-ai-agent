import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Assuming default nextjs setup included fonts or we use system fonts if fails
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Farming AI Agent",
  description: "AI Advice for Farmers using IBM Granite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
