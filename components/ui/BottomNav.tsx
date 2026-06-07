"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Clock, Heart, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/",          icon: Home,   label: t("nav.home")      },
    { href: "/history",   icon: Clock,  label: t("nav.history")   },
    { href: "/upload",    icon: Camera, label: t("nav.scan"),      highlight: true },
    { href: "/favorites", icon: Heart,  label: t("nav.favorites") },
    { href: "/profile",   icon: User,   label: t("nav.profile")   },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      style={{
        background: "rgba(8,12,30,0.92)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-end justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          /* ── Highlight button (camera) ── */
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 -mt-4"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95
                    ${active
                      ? "bg-sky-400 shadow-sky-400/40 scale-105"
                      : "bg-sky-600 shadow-sky-700/50 hover:bg-sky-500"}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-sky-300" : "text-sky-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          /* ── Regular button ── */
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 active:scale-95 transition-transform"
            >
              <div className={`w-6 h-6 flex items-center justify-center transition-colors ${active ? "text-sky-400" : "text-slate-600"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-sky-400" : "text-slate-600"}`}>
                {item.label}
              </span>
              {/* Active dot */}
              {active && (
                <div className="w-1 h-1 rounded-full bg-sky-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
