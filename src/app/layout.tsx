import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "¿Cuándo nacerá Santiago? · Calendario interactivo",
  description: "Apostá en qué día y hora va a nacer Santiago. Elegí tu fecha, dejá tu nombre y seguí el ranking en vivo.",
  keywords: ["calendario", "fecha probable de parto", "baby shower", "votos", "Santiago"],
  authors: [{ name: "Familia de Santiago" }],
  openGraph: {
    title: "¿Cuándo nacerá Santiago?",
    description: "Apostá en qué día y hora va a nacer Santiago",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
