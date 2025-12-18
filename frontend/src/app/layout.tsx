import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kisan Mitra AI | Smart Farming Assistant",
  description: "AI-powered farming advice for Indian farmers using IBM Granite LLM. Get crop recommendations, weather-based guidance, pest control tips, and mandi prices in Hindi, Marathi, and English.",
  keywords: ["farming", "agriculture", "AI", "India", "IBM Granite", "kisan", "mandi", "crop", "weather"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
