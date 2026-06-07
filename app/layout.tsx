import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { FilterProvider } from "./context/FilterContext";
import { LanguageProvider } from "@/lib/i18n";
import BottomNav from "@/components/ui/BottomNav";
import AuthGuard from "@/components/ui/AuthGuard";

export const metadata = {
  title: "RoomScan AI",
  description: "Scan your room — AI picks furniture with real purchase links.",
  openGraph: {
    title: "RoomScan AI",
    description: "Scan your room — AI picks furniture with real purchase links.",
    type: "website",
  },
};

// Next.js 16: viewport must be a separate export
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <LanguageProvider>
        <AppProvider>
          <FilterProvider>
            <AuthGuard>
              {/* Max-width wrapper — centers on desktop, full-width on mobile */}
              <div className="min-h-screen pb-24 flex flex-col max-w-lg mx-auto relative">
                <main className="flex-1">{children}</main>
                <BottomNav />
              </div>
            </AuthGuard>
          </FilterProvider>
        </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
