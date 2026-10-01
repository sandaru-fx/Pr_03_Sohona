import type { MediaKind } from "@prisma/client";

export type MediaRule = {
  kind: MediaKind;
  maxBytes: number;
  mimeTypes: readonly string[];
  extensions: readonly string[];
};

/** Day 4 starting limits — adjust later with client storage budget. */
export const MEDIA_RULES: Record<MediaKind, MediaRule> = {
  PHOTO: {
    kind: "PHOTO",
    maxBytes: 10 * 1024 * 1024, // 10 MB
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  VIDEO: {
    kind: "VIDEO",
    maxBytes: 100 * 1024 * 1024, // 100 MB
    mimeTypes: ["video/mp4", "video/webm"],
    extensions: [".mp4", ".webm"],
  },
  VOICE: {
    kind: "VOICE",
    maxBytes: 20 * 1024 * 1024, // 20 MB
    mimeTypes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/webm",
      "audio/x-wav",
    ],
    extensions: [".mp3", ".m4a", ".wav", ".webm"],
  },
};

export type UploadValidationInput = {
  kind: string;
  contentType: string;
  sizeBytes: number;
  fileName: string;
};

export type UploadValidationResult =
  | {
      ok: true;
      kind: MediaKind;
      contentType: string;
      sizeBytes: number;
      fileName: string;
      extension: string;
    }
  | {
      ok: false;
      error: string;
      message: string;
    };

const MEDIA_KINDS = new Set<string>(Object.keys(MEDIA_RULES));

function normalizeContentType(value: string): string {
  return value.trim().toLowerCase().split(";")[0]?.trim() ?? "";
}

function getExtension(fileName: string): string {
  const base = fileName.trim().split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot).toLowerCase();
}

/**
 * Strip path segments and unsafe characters from an original file name.
 * Result is suitable only as a suffix inside a controlled object key.
 */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.trim().split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .replace(/[^\w.\-()+ ]+/g, "_")
    .replace(/\s+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);

  return cleaned.length > 0 ? cleaned : "file";
}

export function isMediaKind(value: string): value is MediaKind {
  return MEDIA_KINDS.has(value);
}

/**
 * Validate kind + MIME + size + extension before issuing a presigned upload.
 */
export function validateUploadRequest(
  input: UploadValidationInput,
): UploadValidationResult {
  if (!isMediaKind(input.kind)) {
    return {
      ok: false,
      error: "InvalidKind",
      message: "kind must be PHOTO, VIDEO, or VOICE.",
    };
  }

  const rule = MEDIA_RULES[input.kind];
  const contentType = normalizeContentType(input.contentType);
  const extension = getExtension(input.fileName);
  const sizeBytes = input.sizeBytes;

  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    return {
      ok: false,
      error: "InvalidSize",
      message: "sizeBytes must be a positive integer.",
    };
  }

  if (sizeBytes > rule.maxBytes) {
    return {
      ok: false,
      error: "FileTooLarge",
      message: `${input.kind} files must be at most ${rule.maxBytes} bytes.`,
    };
  }

  if (!rule.mimeTypes.includes(contentType)) {
    return {
      ok: false,
      error: "InvalidContentType",
      message: `${input.kind} does not allow content type "${contentType || "(empty)"}".`,
    };
  }

  if (!rule.extensions.includes(extension)) {
    return {
      ok: false,
      error: "InvalidExtension",
      message: `${input.kind} does not allow extension "${extension || "(none)"}".`,
    };
  }

  return {
    ok: true,
    kind: input.kind,
    contentType,
    sizeBytes,
    fileName: sanitizeFileName(input.fileName),
    extension,
  };
}
