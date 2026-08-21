import type { Metadata } from "next";
import { Zilla_Slab, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const zillaSlab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Study Helper",
  description: "Explain concepts and quiz yourself on your notes",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${zillaSlab.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased font-(family-name:--font-body)`}
      >
        {children}
      </body>
    </html>
  );
}