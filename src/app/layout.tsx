import type { Metadata } from "next";
import {
  Inter,
  Montserrat,
  Oswald,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

/**
 * The StoryBrand-inspired marketing type pairing (R2): Oswald — a tall,
 * condensed grotesque — for uppercase display headlines, and Montserrat for
 * body and UI. Both are scoped to `.fr-site` in globals.css; the CRM keeps its
 * own system stack.
 */
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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

/**
 * Plus Jakarta Sans — the heading face in the client's own build
 * (/Reference/FoodRaksha-NextJS/tailwind.config.ts: fontFamily.heading). Applied
 * to marketing headings via --font-fr-heading; the CRM keeps the system stack.
 */
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${oswald.variable} ${montserrat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
