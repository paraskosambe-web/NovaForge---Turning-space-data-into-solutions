import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./responsive.css";

export const metadata: Metadata = {
  title: "NovaForge · Flame in Freefall",
  description: "A source-grounded exploration of NASA microgravity combustion investigations for space fire-safety research.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}
