import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import type {
  PublicMediaMetaItem,
  PublicStatementItem,
} from "@/lib/public-profile";

type MemorialViewProps = {
  displayName: string;
  statements: PublicStatementItem[];
  media: PublicMediaMetaItem[];
  pinProtected: boolean;
  r2Configured: boolean;
};

export function MemorialView({
  displayName,
  statements,
  media,
  pinProtected,
  r2Configured,
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
          Media opens through short-lived secure links. Nothing is stored as a
          permanent public URL.
        </p>

        {!r2Configured && media.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Cloudflare R2 is not connected yet, so playback is paused. Metadata
            still shows what the family uploaded.
          </div>
        ) : null}

        {media.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-500">No media uploaded yet.</p>
        ) : (
          <ul className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            {media.map((item) => (
              <MemorialMediaItem
                key={item.id}
                item={item}
                enabled={r2Configured}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
