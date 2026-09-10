"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Alert } from "@/components/ui/Alert";

type AdminShellProps = {
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  userName,
  userEmail,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-background text-foreground">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-foreground-secondary transition hover:bg-background-secondary hover:text-foreground"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Sohona Admin
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <Alert tone="info">
              Family memories are private and cannot be accessed by temple
              administrators.
            </Alert>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
