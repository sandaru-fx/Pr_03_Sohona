"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  busy?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
};

export function Modal({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  busy = false,
  onConfirm,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sohona-modal-title"
        className={cn(
          "w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-none",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="sohona-modal-title"
              className="font-display text-xl text-foreground"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted transition hover:bg-gold-subtle hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button
              variant={confirmVariant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              disabled={busy}
            >
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
