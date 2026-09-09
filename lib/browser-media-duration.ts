/**
 * Browser-only: read media duration from a File via temporary object URL.
 */
export function readFileDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    const el = document.createElement(isVideo ? "video" : "audio");
    el.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      el.removeAttribute("src");
      el.load();
    };

    el.onloadedmetadata = () => {
      const duration = el.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Could not read media duration."));
        return;
      }
      resolve(duration);
    };

    el.onerror = () => {
      cleanup();
      reject(new Error("Could not load media for duration check."));
    };

    el.src = url;
  });
}
