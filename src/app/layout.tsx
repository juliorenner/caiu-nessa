import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FUNDO_PAGINA } from "@/components/rotulos";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caiu Nessa?",
  description: "12 afirmações da eleição. Verdade, mentira ou enganoso? Descubra em quantas você caiu.",
};

export const viewport: Viewport = { colorScheme: "light dark", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`flex min-h-full flex-col font-sans ${FUNDO_PAGINA}`}>{children}</body>
    </html>
  );
}
