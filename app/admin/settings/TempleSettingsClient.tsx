"use client";

import { useState } from "react";
import { Check, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TempleSettings = {
  templeName: string;
  templeAddress: string | null;
  templePhone: string | null;
  templeEmail: string | null;
};

export function TempleSettingsClient({
  initial,
}: {
  initial: TempleSettings | null;
}) {
  const [form, setForm] = useState<TempleSettings>({
    templeName: initial?.templeName ?? "Mathaka QR",
    templeAddress: initial?.templeAddress ?? "",
    templePhone: initial?.templePhone ?? "",
    templeEmail: initial?.templeEmail ?? "",
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const set = (k: keyof TempleSettings, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave() {
    if (!form.templeName.trim()) {
      setError("Organization name is required.");
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/temple-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Failed to save settings.");
      } else {
        showToast("Organization details saved ✓");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
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
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Organization Name <span className="text-error">*</span>
          </label>
          <input
            value={form.templeName}
            onChange={(e) => set("templeName", e.target.value)}
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Public Contact Email
          </label>
          <input
            type="email"
            value={form.templeEmail ?? ""}
            onChange={(e) => set("templeEmail", e.target.value)}
            placeholder="contact@example.com"
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Contact Number
          </label>
          <input
            value={form.templePhone ?? ""}
            onChange={(e) => set("templePhone", e.target.value)}
            placeholder="+94 XX XXX XXXX"
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground-secondary">
            Address
          </label>
          <input
            value={form.templeAddress ?? ""}
            onChange={(e) => set("templeAddress", e.target.value)}
            placeholder="Main Road, City"
            disabled={saving}
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm text-foreground outline-none transition-all focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => void handleSave()}
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
            <><Check className="h-4 w-4" /> Save Details</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
