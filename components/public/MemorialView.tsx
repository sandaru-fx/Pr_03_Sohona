import { FileAudio, FileImage, FileVideo } from "lucide-react";
import type {
  PublicMediaMetaItem,
  PublicStatementItem,
} from "@/lib/public-profile";

type MemorialViewProps = {
  displayName: string;
  statements: PublicStatementItem[];
  media: PublicMediaMetaItem[];
  pinProtected: boolean;
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaIcon({ kind }: { kind: PublicMediaMetaItem["kind"] }) {
  if (kind === "PHOTO") return <FileImage className="h-4 w-4" aria-hidden />;
  if (kind === "VIDEO") return <FileVideo className="h-4 w-4" aria-hidden />;
  return <FileAudio className="h-4 w-4" aria-hidden />;
}

export function MemorialView({
  displayName,
  statements,
  media,
  pinProtected,
}: MemorialViewProps) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          {displayName}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          A private memorial space. View only — editing is not available here.
        </p>
        {pinProtected ? (
          <p className="mt-4 text-xs text-zinc-500">
            Unlocked with PIN for this device session.
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-medium text-zinc-900">Memories</h2>
        {statements.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No statements have been added yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {statements.map((item) => (
              <li
                key={item.id}
                className="border-l-2 border-zinc-200 pl-4 text-sm leading-7 text-zinc-800"
              >
                {item.body}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-medium text-zinc-900">
          Photos, videos & voice
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Media files are listed here. Secure playback arrives in Day 7.
        </p>

        {media.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-500">No media uploaded yet.</p>
        ) : (
          <ul className="mt-5 divide-y divide-zinc-200 rounded-xl border border-zinc-200">
            {media.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                  <MediaIcon kind={item.kind} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {item.originalName ?? item.kind}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.kind} · {formatBytes(item.sizeBytes)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">Locked</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
