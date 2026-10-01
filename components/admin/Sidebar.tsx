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
import { motion } from "framer-motion";

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
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#2A2E33] bg-[#181C20] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 shadow-2xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold shadow-[0_0_15px_-3px_rgba(212,175,55,0.2)]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="font-sans text-lg font-medium tracking-tight text-[#F5F1E8]">
                Mathaka QR
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">Admin Portal</p>
            </div>
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

        <nav className="flex-1 space-y-1.5 px-3 py-6" aria-label="Admin">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gold/10 text-gold shadow-[inset_0_0_20px_-5px_rgba(212,175,55,0.15)]"
                    : "text-foreground-secondary hover:bg-background-secondary hover:text-[#F5F1E8]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-xl border border-gold/30 bg-gold/5"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 relative z-10", active ? "scale-110" : "group-hover:scale-110")} aria-hidden />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-xl border border-border/50 bg-background-secondary/50 px-3 py-3 transition-colors hover:border-border hover:bg-background-secondary">
            <p className="truncate text-sm font-medium text-[#F5F1E8]">
              {userName ?? "Admin"}
            </p>
            {userEmail ? (
              <p className="truncate text-xs text-foreground-muted mt-0.5">
                {userEmail}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-all hover:bg-background-secondary hover:text-[#F5F1E8]"
            >
              <ExternalLink className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-hover:text-gold" aria-hidden />
              View Public Site
            </Link>
          
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-all hover:bg-error/10 hover:text-error"
              >
                <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5" aria-hidden />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
