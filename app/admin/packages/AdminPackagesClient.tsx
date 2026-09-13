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
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

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
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
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
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
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
              className="h-10 flex-1 rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
            />
            <input
              value={form.priceCurrency}
              onChange={(e) => set("priceCurrency", e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="LKR"
              disabled={saving}
              className="h-10 w-20 rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 pt-5">
          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            {form.isActive ? (
              <ToggleRight className="h-6 w-6 text-gold" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-foreground-muted" />
            )}
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
          className="mt-1.5 w-full rounded-xl border border-border bg-background-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50 resize-none"
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
          className="mt-1.5 w-full rounded-xl border border-border bg-background-secondary px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition",
            saving
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold hover:opacity-90",
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
          className="inline-flex h-10 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground transition hover:bg-background-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
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
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-success/30 bg-surface px-4 py-3 text-sm font-medium text-success shadow-lg animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
            Packages
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Manage memorial packages. Each package defines a retention period shown on public pages and used when creating memorials.
          </p>
        </div>
        {mode === "idle" && (
          <button
            onClick={() => { setMode("create"); setFormError(null); }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Package
          </button>
        )}
      </div>

      {/* Create Form */}
      {mode === "create" && (
        <div className="rounded-2xl border border-gold/30 bg-surface p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F5F1E8]">New Package</h2>
            <button onClick={() => setMode("idle")} className="rounded-lg p-1.5 text-foreground-muted hover:text-foreground">
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
        </div>
      )}

      {/* Packages List */}
      {packages.length === 0 && mode === "idle" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
          <Package className="h-10 w-10 text-foreground-muted" />
          <p className="mt-4 text-sm font-medium text-foreground">No packages yet</p>
          <p className="mt-1 text-sm text-foreground-secondary">Create your first package to start offering memorials.</p>
          <button
            onClick={() => { setMode("create"); setFormError(null); }}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New Package
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {packages.map((pkg) => {
            const isEditing = typeof mode === "object" && mode.edit === pkg.id;
            return (
              <li
                key={pkg.id}
                className={cn(
                  "rounded-2xl border bg-surface transition",
                  isEditing ? "border-gold/40" : "border-border",
                )}
              >
                {isEditing ? (
                  <div className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-[#F5F1E8]">
                        Edit — {pkg.name}
                      </h2>
                      <button
                        onClick={() => setMode("idle")}
                        className="rounded-lg p-1.5 text-foreground-muted hover:text-foreground"
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
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-base font-semibold text-[#F5F1E8]">
                          {pkg.name}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            pkg.isActive
                              ? "bg-success/10 text-success"
                              : "bg-surface-elevated text-foreground-muted",
                          )}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="rounded-full bg-gold-subtle px-2 py-0.5 text-[11px] font-medium text-gold">
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
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => { setMode({ edit: pkg.id }); setFormError(null); }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition hover:border-gold/40 hover:text-gold"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(pkg); setDeleteError(null); }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-foreground-muted transition hover:border-error/40 hover:text-error"
                        disabled={pkg._count.profiles > 0}
                        title={pkg._count.profiles > 0 ? "Cannot delete — memorials exist" : "Delete"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">
              Delete package?
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{deleteTarget.name}</span>?
              This cannot be undone.
            </p>
            {deleteError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {deleteError}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition",
                  deleting ? "bg-foreground-muted cursor-not-allowed" : "bg-error hover:opacity-90",
                )}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Deleting…" : "Yes, delete"}
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
