"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogOut,
  Package,
  PlusCircle,
  Settings,
  ShieldAlert,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAdmin } from "@/app/admin/actions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/profiles", label: "Memorials", icon: Users },
  { href: "/admin/create", label: "Create Memorial", icon: PlusCircle },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/security", label: "Security Logs", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

type SidebarProps = {
  userName?: string | null;
  userEmail?: string | null;
  mobileOpen: boolean;
  onClose: () => void;
};

export function Sidebar({
  userName,
  userEmail,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/70 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#2A2E33] bg-[#181C20] transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div>
            <p className="font-sans text-lg font-medium tracking-tight text-[#F5F1E8]">
              Mathaka QR
            </p>
            <p className="text-xs text-gray-500">Temple Admin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition hover:bg-surface-elevated hover:text-foreground lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
          {navItems.map(({ href, label, icon: Icon, ...rest }) => {
            const exact = "exact" in rest && rest.exact;
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-gold-subtle text-gold"
                    : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 rounded-xl border border-border bg-background-secondary px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">
              {userName ?? "Admin"}
            </p>
            {userEmail ? (
              <p className="truncate text-xs text-foreground-muted">
                {userEmail}
              </p>
            ) : null}
          </div>

          <div className="mb-2 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-secondary transition hover:bg-background-secondary hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              View Public Site
            </Link>
          </div>

          <form action={signOutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-secondary transition hover:bg-background-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
