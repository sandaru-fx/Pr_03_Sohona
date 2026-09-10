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
    <div className="flex min-h-full bg-[#0B0D0F] text-[#F5F1E8]">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#2A2E33] bg-[#181C20]/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[#0B0D0F] hover:text-[#F5F1E8]"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-[#F5F1E8]">
              Mathaka QR Admin
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
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
