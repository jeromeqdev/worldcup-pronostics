import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pronostics Coupe du Monde 2026",
  description: "Concours de pronostics entre collègues et amis pour la Coupe du Monde 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${barlowCondensed.variable} ${inter.variable} dark`}>
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
            {children}
          </main>
          <footer className="border-t border-surface-700 py-4 text-center text-xs text-gray-500">
            Pronostics CdM 2026 — Fait avec ⚽ entre amis
          </footer>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a2520",
              color: "#f1f5f4",
              border: "1px solid #2d3f35",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#0a0f0d" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0a0f0d" } },
          }}
        />
      </body>
    </html>
  );
}
