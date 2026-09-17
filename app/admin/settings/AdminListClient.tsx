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
import { motion, AnimatePresence } from "framer-motion";

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

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-5"
    >
      <AnimatePresence>
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-success/30 bg-surface/90 px-4 py-3 text-sm font-medium text-success shadow-[0_0_30px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md"
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add admin */}
      <div className="rounded-2xl border border-border bg-surface p-5 transition-all focus-within:border-gold/30 focus-within:shadow-[0_0_20px_-5px_rgba(212,175,55,0.1)]">
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
              "h-10 flex-1 rounded-xl border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all",
              "placeholder:text-foreground-muted focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50",
              addError ? "border-error focus-visible:border-error focus-visible:ring-error/20" : "border-border",
            )}
          />
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={adding}
            className={cn(
              "relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium text-background transition-all",
              adding 
                ? "cursor-not-allowed bg-foreground-muted" 
                : "bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            {adding ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</>
            ) : (
              <><Plus className="h-4 w-4" /> Add Admin</>
            )}
          </button>
        </div>
        <AnimatePresence>
          {addError && (
            <motion.p 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="flex items-center gap-1.5 text-xs text-error overflow-hidden"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> {addError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Admin list */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-5 py-3.5 bg-background-secondary/50">
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
          <motion.ul 
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-border"
          >
            <AnimatePresence>
              {admins.map((entry) => {
                const isYou = entry.email === currentEmail;
                const hasSignedIn = !!entry.user;
                return (
                  <motion.li
                    key={entry.email}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-background-secondary/30"
                  >
                    {/* Avatar / icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted overflow-hidden ring-1 ring-border group-hover:ring-gold/30 transition-all">
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
                          <span className="rounded-full bg-gold-subtle px-2 py-0.5 text-[11px] font-medium text-gold border border-gold/20">
                            You
                          </span>
                        )}
                        {entry.isEnv && (
                          <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-foreground-muted border border-border">
                            Super-admin (env)
                          </span>
                        )}
                        {!hasSignedIn && !entry.isEnv && (
                          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] text-warning border border-warning/20">
                            Invited — not signed in yet
                          </span>
                        )}
                        {hasSignedIn && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] text-success border border-success/20 flex items-center gap-1">
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
                        className="ml-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground-muted opacity-0 transition-all group-hover:opacity-100 hover:border-error/40 hover:bg-error/10 hover:text-error focus-visible:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl overflow-hidden"
            >
              <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">Remove admin access?</h2>
              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                <span className="font-medium text-foreground">{deleteTarget.email}</span> will no longer be able to sign in to the admin panel. Their existing session will be invalidated.
              </p>
              
              <AnimatePresence>
                {deleteError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {deleteError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => void handleDelete(deleteTarget)}
                  disabled={deleting}
                  className={cn(
                    "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-all",
                    deleting 
                      ? "bg-foreground-muted cursor-not-allowed" 
                      : "bg-error hover:opacity-90 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]",
                  )}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Removing…" : "Yes, remove"}
                </button>
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                  disabled={deleting}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background-secondary hover:text-[#F5F1E8]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
