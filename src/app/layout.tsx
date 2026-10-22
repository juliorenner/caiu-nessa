import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bungee, Bungee_Shade } from "next/font/google";
import { FUNDO_PAGINA } from "@/components/rotulos";
import { DESCRICAO, SITE_URL, TITULO } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: TITULO,
  description: DESCRICAO,
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: "/",
    siteName: TITULO,
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
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
