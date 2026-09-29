import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Caveat, Space_Grotesk } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--f-display",
});

const sans = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--f-sans",
});

const hand = Caveat({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--f-hand",
});

export const metadata: Metadata = {
  title: {
    default: "ComicCraft — AI Comic Story Creator",
    template: "%s · ComicCraft",
  },
  description:
    "Turn a sentence into a five-panel comic. ComicCraft outlines, narrates, illustrates and exports personalized comics as PDF — powered by AI story and image pipelines.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hand.variable}`}>
      <body className="grain min-h-screen bg-ink text-paper antialiased">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
