import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter is the non-Apple fallback only. On Apple hardware the system stack in
 * globals.css resolves to genuine SF Pro long before Inter is reached.
 * SF Pro is never loaded as a webfont — Apple's licence does not permit it.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FoodRaksha",
  description: "FSSAI licensing, handled.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
