import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Manege De Raam - D'n Perdenbak | Lieshout",
    template: "%s | Manege De Raam",
  },
  description: "Stichting Manege De Raam beheert Manege D'n Perdenbak in Lieshout. Professionele rijhal 25×50m met Equisport zandboden. Online reserveren, KNHS wedstrijden, en verhuur faciliteiten.",
  keywords: ["manege", "de raam", "perdenbak", "lieshout", "paarden", "rijhal", "dressuur", "knhs", "reservering", "brabant"],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.svg' },
    ],
  },
  openGraph: {
    title: "Manege De Raam - D'n Perdenbak",
    description: "Professionele paardensportfaciliteiten in Lieshout. 25×50m rijhal, KNHS wedstrijden, online reserveren.",
    url: 'https://stichtingderaam.nl',
    siteName: 'Manege De Raam',
    locale: 'nl_NL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
