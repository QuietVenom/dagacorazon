import type { Metadata, Viewport } from "next";
import { Cinzel, Crimson_Text, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { htmlLang } from "@/lib/i18n-core";
import { siteUrl } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DiceRoller } from "@/components/dice-roller";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dagacorazón — Homebrew de Daggerheart para LATAM",
  description:
    "Crea, comparte y juega contenido casero de Daggerheart en español y portugués: adversarios, colosos, entornos, equipo y mesa de juego.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a13",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getCurrentLanguage();

  return (
    <html
      lang={htmlLang(language)}
      className={`${cinzel.variable} ${crimson.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider initialLanguage={language}>
          <SiteNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <DiceRoller />
        </LanguageProvider>
      </body>
    </html>
  );
}
