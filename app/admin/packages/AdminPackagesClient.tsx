"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Edit2,
  Loader2,
  Package,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  retentionYears: number;
  priceAmount: number | null;
  priceCurrency: string;
  features: string[];
  isActive: boolean;
  _count: { profiles: number };
};

type FormData = {
  name: string;
  description: string;
  retentionYears: string;
  priceAmount: string;
  priceCurrency: string;
  features: string;
  isActive: boolean;
};

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  retentionYears: "25",
  priceAmount: "",
  priceCurrency: "LKR",
  features: "",
  isActive: true,
};

function pkgToForm(p: PackageRow): FormData {
  return {
    name: p.name,
    description: p.description ?? "",
    retentionYears: String(p.retentionYears),
    priceAmount: p.priceAmount != null ? String(p.priceAmount) : "",
    priceCurrency: p.priceCurrency,
    features: p.features.join("\n"),
    isActive: p.isActive,
  };
}

function formToPayload(f: FormData) {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    retentionYears: parseInt(f.retentionYears, 10),
    priceAmount: f.priceAmount.trim() !== "" ? parseFloat(f.priceAmount) : null,
    priceCurrency: f.priceCurrency.trim() || "LKR",
    features: f.features
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    isActive: f.isActive,
  };
}

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function PackageForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-5 overflow-hidden"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Package name <span className="text-error">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Heritage"
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>

        {/* Retention */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Retention years <span className="text-error">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={form.retentionYears}
            onChange={(e) => set("retentionYears", e.target.value)}
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Price (optional)
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.priceAmount}
              onChange={(e) => set("priceAmount", e.target.value)}
              placeholder="e.g. 15000"
              disabled={saving}
              className="h-10 flex-1 rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
            />
            <input
              value={form.priceCurrency}
              onChange={(e) => set("priceCurrency", e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="LKR"
              disabled={saving}
              className="h-10 w-20 rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg p-1"
          >
            <motion.div layout>
              {form.isActive ? (
                <ToggleRight className="h-6 w-6 text-gold" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-foreground-muted" />
              )}
            </motion.div>
            {form.isActive ? "Active" : "Inactive"}
          </button>
          <span className="text-xs text-foreground-muted">
            Inactive packages won't appear for new memorials
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-foreground-secondary">
          Description (optional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Short description shown on public packages page…"
          disabled={saving}
          className="mt-1.5 w-full rounded-xl border border-border bg-background-secondary px-3 py-2 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50 resize-none"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-xs font-medium text-foreground-secondary">
          Features (one per line)
        </label>
        <textarea
          value={form.features}
          onChange={(e) => set("features", e.target.value)}
          rows={4}
          placeholder={"Family PIN + admin-blind privacy\nRetention starts at setup complete\n…"}
          disabled={saving}
          className="mt-1.5 w-full rounded-xl border border-border bg-background-secondary px-3 py-2 font-mono text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className={cn(
            "relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium text-background transition-all",
            saving
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98]",
          )}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Check className="h-4 w-4" /> Save package</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-10 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary hover:text-[#F5F1E8]"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export function AdminPackagesClient({
  initialPackages,
}: {
  initialPackages: PackageRow[];
}) {
  const [packages, setPackages] = useState<PackageRow[]>(initialPackages);
  const [mode, setMode] = useState<"idle" | "create" | { edit: string }>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PackageRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleCreate(form: FormData) {
    const payload = formToPayload(form);
    if (!payload.name) { setFormError("Package name is required."); return; }
    if (!payload.retentionYears || payload.retentionYears < 1) { setFormError("Enter a valid retention years number."); return; }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.issues?.[0]?.message ?? data.message ?? "Failed to create.");
      } else {
        setPackages((prev) => [...prev, { ...data.package, _count: { profiles: 0 } }]);
        setMode("idle");
        showToast("Package created ✓");
      }
    } catch {
      setFormError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, form: FormData) {
    const payload = formToPayload(form);
    if (!payload.name) { setFormError("Package name is required."); return; }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.issues?.[0]?.message ?? data.message ?? "Failed to update.");
      } else {
        setPackages((prev) =>
          prev.map((p) => (p.id === id ? { ...data.package, _count: p._count } : p)),
        );
        setMode("idle");
        showToast("Package updated ✓");
      }
    } catch {
      setFormError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pkg: PackageRow) {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message ?? "Could not delete.");
      } else {
        setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
        setDeleteTarget(null);
        showToast("Package deleted.");
      }
    } catch {
      setDeleteError("Network error. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
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

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
            Packages
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Manage memorial packages. Each package defines a retention period shown on public pages and used when creating memorials.
          </p>
        </div>
        <AnimatePresence>
          {mode === "idle" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => { setMode("create"); setFormError(null); }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] px-5 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)]"
            >
              <Plus className="h-4 w-4" />
              New Package
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence mode="popLayout">
        {mode === "create" && (
          <motion.div 
            layoutId="create-form"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="rounded-2xl border border-gold/30 bg-surface p-6 shadow-[0_0_30px_-5px_rgba(212,175,55,0.1)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#F5F1E8]">New Package</h2>
              <button 
                onClick={() => setMode("idle")} 
                className="rounded-lg p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <PackageForm
              initial={EMPTY_FORM}
              onSave={handleCreate}
              onCancel={() => setMode("idle")}
              saving={saving}
              error={formError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packages List */}
      <AnimatePresence mode="popLayout">
        {packages.length === 0 && mode === "idle" ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center"
          >
            <Package className="h-10 w-10 text-foreground-muted" />
            <p className="mt-4 text-sm font-medium text-foreground">No packages yet</p>
            <p className="mt-1 text-sm text-foreground-secondary">Create your first package to start offering memorials.</p>
            <button
              onClick={() => { setMode("create"); setFormError(null); }}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-background transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" /> New Package
            </button>
          </motion.div>
        ) : (
          <motion.ul 
            key="list"
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence>
              {packages.map((pkg) => {
                const isEditing = typeof mode === "object" && mode.edit === pkg.id;
                return (
                  <motion.li
                    layout
                    key={pkg.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "rounded-2xl border bg-surface transition-colors overflow-hidden relative",
                      isEditing ? "border-gold/40 shadow-[0_0_25px_-5px_rgba(212,175,55,0.08)]" : "border-border hover:border-gold/20"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div 
                          key="edit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-6"
                        >
                          <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-[#F5F1E8]">
                              Edit — {pkg.name}
                            </h2>
                            <button
                              onClick={() => setMode("idle")}
                              className="rounded-lg p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <PackageForm
                            initial={pkgToForm(pkg)}
                            onSave={(form) => handleUpdate(pkg.id, form)}
                            onCancel={() => setMode("idle")}
                            saving={saving}
                            error={formError}
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between group"
                        >
                          {/* Left: info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-sans text-base font-semibold text-[#F5F1E8]">
                                {pkg.name}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[11px] font-medium border",
                                  pkg.isActive
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-surface-elevated text-foreground-muted border-border",
                                )}
                              >
                                {pkg.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="rounded-full bg-gold-subtle px-2 py-0.5 text-[11px] font-medium text-gold border border-gold/20">
                                {pkg.retentionYears} yrs
                              </span>
                              <span className="text-xs text-foreground-muted">
                                {pkg._count.profiles} memorial{pkg._count.profiles !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="mt-1.5 text-sm text-foreground-secondary leading-6">
                                {pkg.description}
                              </p>
                            )}
                            {pkg.priceAmount != null && (
                              <p className="mt-1 text-xs text-foreground-muted">
                                {pkg.priceCurrency} {pkg.priceAmount.toLocaleString()}
                              </p>
                            )}
                            {pkg.features.length > 0 && (
                              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                {pkg.features.map((f) => (
                                  <li key={f} className="flex items-center gap-1 text-xs text-foreground-muted">
                                    <Check className="h-3 w-3 text-gold shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Right: actions */}
                          <div className="flex shrink-0 items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setMode({ edit: pkg.id }); setFormError(null); }}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-all hover:border-gold/40 hover:text-gold hover:bg-gold/5"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(pkg); setDeleteError(null); }}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground-muted transition-all hover:border-error/40 hover:text-error hover:bg-error/10"
                              disabled={pkg._count.profiles > 0}
                              title={pkg._count.profiles > 0 ? "Cannot delete — memorials exist" : "Delete"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
              <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">
                Delete package?
              </h2>
              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">{deleteTarget.name}</span>?
                This cannot be undone.
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
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {deleteError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={deleting}
                  className={cn(
                    "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-all",
                    deleting 
                      ? "bg-foreground-muted cursor-not-allowed" 
                      : "bg-error hover:opacity-90 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]",
                  )}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleting ? "Deleting…" : "Yes, delete"}
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
    </div>
  );
}
