import type { Metadata, Viewport } from "next";
// Self-hosted via Fontsource: no runtime or build-time request to Google Fonts.
import "@fontsource-variable/orbitron";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIGHT//SHIFT — Welcome to the city that never sleeps",
  description:
    "An immersive, original cyberpunk experience in three worlds: the city, its operating system and the underground beneath it.",
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
