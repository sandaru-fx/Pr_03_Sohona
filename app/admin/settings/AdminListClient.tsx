"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminEntry = {
  id: string | null;
  email: string;
  addedBy: string | null;
  createdAt: string | null;
  isEnv: boolean;
  user: {
    name: string | null;
    image: string | null;
    isDisabled: boolean;
  } | null;
};

export function AdminListClient({
  initial,
  currentEmail,
}: {
  initial: AdminEntry[];
  currentEmail: string;
}) {
  const [admins, setAdmins] = useState<AdminEntry[]>(initial);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAdd() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setAddError("Enter a valid email address.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message ?? "Could not add admin.");
      } else {
        const newEntry: AdminEntry = {
          id: data.invite.id,
          email: data.invite.email,
          addedBy: data.invite.addedBy,
          createdAt: data.invite.createdAt,
          isEnv: false,
          user: null,
        };
        setAdmins((prev) => [...prev, newEntry]);
        setEmail("");
        showToast("Admin added ✓ — they can now sign in with Google.");
      }
    } catch {
      setAddError("Network error. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(entry: AdminEntry) {
    if (!entry.id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/admins/${entry.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message ?? "Could not remove admin.");
      } else {
        setAdmins((prev) => prev.filter((a) => a.id !== entry.id));
        setDeleteTarget(null);
        showToast("Admin removed.");
      }
    } catch {
      setDeleteError("Network error. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-success/30 bg-surface px-4 py-3 text-sm font-medium text-success shadow-lg">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Add admin */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-medium text-foreground">Add admin</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Enter a Gmail address. Once added, they can sign in with Google and access the admin panel.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAddError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") void handleAdd(); }}
            placeholder="someone@gmail.com"
            disabled={adding}
            className={cn(
              "h-10 flex-1 rounded-xl border bg-background-secondary px-3 text-sm text-foreground outline-none transition",
              "placeholder:text-foreground-muted focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50",
              addError ? "border-error" : "border-border",
            )}
          />
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={adding}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition",
              adding ? "cursor-not-allowed bg-foreground-muted" : "bg-gold hover:opacity-90",
            )}
          >
            {adding ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</>
            ) : (
              <><Plus className="h-4 w-4" /> Add Admin</>
            )}
          </button>
        </div>
        {addError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-error">
            <AlertTriangle className="h-3.5 w-3.5" /> {addError}
          </p>
        )}
      </div>

      {/* Admin list */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-medium text-foreground">
            Current admins ({admins.length})
          </p>
        </div>
        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Shield className="h-8 w-8 text-foreground-muted" />
            <p className="mt-3 text-sm text-foreground-muted">No admins configured.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {admins.map((entry) => {
              const isYou = entry.email === currentEmail;
              const hasSignedIn = !!entry.user;
              return (
                <li
                  key={entry.email}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  {/* Avatar / icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted overflow-hidden">
                    {entry.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.user.image} alt="" className="h-full w-full object-cover" />
                    ) : hasSignedIn ? (
                      <UserCheck className="h-4 w-4 text-gold" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {entry.user?.name ?? entry.email}
                      </span>
                      {isYou && (
                        <span className="rounded-full bg-gold-subtle px-2 py-0.5 text-[11px] font-medium text-gold">
                          You
                        </span>
                      )}
                      {entry.isEnv && (
                        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-foreground-muted">
                          Super-admin (env)
                        </span>
                      )}
                      {!hasSignedIn && !entry.isEnv && (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] text-warning">
                          Invited — not signed in yet
                        </span>
                      )}
                      {hasSignedIn && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-foreground-muted">
                      {entry.email}
                      {entry.addedBy && !entry.isEnv && ` · Added by ${entry.addedBy}`}
                    </p>
                  </div>

                  {/* Remove btn — cannot remove env or self */}
                  {!entry.isEnv && !isYou && entry.id && (
                    <button
                      onClick={() => { setDeleteTarget(entry); setDeleteError(null); }}
                      className="ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground-muted transition hover:border-error/40 hover:text-error"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">Remove admin access?</h2>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              <span className="font-medium text-foreground">{deleteTarget.email}</span> will no longer be able to sign in to the admin panel. Their existing session will be invalidated.
            </p>
            {deleteError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {deleteError}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => void handleDelete(deleteTarget)}
                disabled={deleting}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition",
                  deleting ? "bg-foreground-muted cursor-not-allowed" : "bg-error hover:opacity-90",
                )}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Removing…" : "Yes, remove"}
              </button>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                disabled={deleting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground transition hover:bg-background-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
