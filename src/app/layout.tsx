// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Memcoin Tracker - Twój osobisty asystent na giełdzie kryptowalut",
  description:
    "Aplikacja do śledzenia memcoinów i wybierania tych z dużym prawdopodobieństwem sukcesu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-16 pb-8 min-h-screen">{children}</main>
          <footer className="bg-white dark:bg-gray-800 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="container mx-auto">
              <p>
                &copy; {new Date().getFullYear()} Memcoin Tracker - Wszelkie
                prawa zastrzeżone
              </p>
              <p className="mt-1">
                Zastrzeżenie: Aplikacja nie stanowi porady inwestycyjnej.
                Inwestuj na własne ryzyko.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
