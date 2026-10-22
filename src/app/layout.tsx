import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bungee, Bungee_Shade } from "next/font/google";
import { FUNDO_PAGINA } from "@/components/rotulos";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bungee",
});

const bungeeShade = Bungee_Shade({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bungee-shade",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-atkinson",
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
      className={`${bungee.variable} ${bungeeShade.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className={`flex min-h-full flex-col font-sans ${FUNDO_PAGINA}`}>{children}</body>
    </html>
  );
}
