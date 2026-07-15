"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

/**
 * Shared chrome for both secure portals: top bar + tabbed navigation.
 */
export default function PortalShell({ title, badge, nav, user, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-royal-50">
      <header className="bg-royal text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-serif text-royal">
              LA
            </div>
            <div className="leading-tight">
              <p className="font-serif text-sm font-bold">{title}</p>
              <p className="text-xs text-crimson-600 text-white/60">{badge}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/70 sm:block">{user?.name}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && item.href !== "/teacher" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                  active ? "bg-royal-50 text-royal" : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
