import { MemorialComments } from "@/components/public/MemorialComments";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  PublicCommentItem,
  PublicMediaMetaItem,
  PublicStatementItem,
} from "@/lib/public-profile";

type MemorialViewProps = {
  displayName: string;
  qrId: string;
  packageTier?: "A" | "B" | "C";
  statements: PublicStatementItem[];
  media: PublicMediaMetaItem[];
  comments: PublicCommentItem[];
  commentQuota: {
    used: number;
    max: number;
    nextMaxWords: number | null;
  };
  pinProtected: boolean;
  r2Configured: boolean;
};

export function MemorialView({
  displayName,
  qrId,
  packageTier = "A",
  statements,
  media,
  comments,
  commentQuota,
  pinProtected,
  r2Configured,
}: MemorialViewProps) {
  const photos = media.filter((item) => item.kind === "PHOTO");
  const videos = media.filter((item) => item.kind === "VIDEO");
  const voices = media.filter((item) => item.kind === "VOICE");

  return (
    <div className="w-full max-w-2xl space-y-10 sm:space-y-12">
      <header className="px-2 py-8 text-center sm:py-12">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          In remembrance
        </p>
        <h1 className="mt-5 font-sans text-4xl font-medium tracking-tight text-[#F5F1E8] sm:text-5xl sm:leading-tight">
          {displayName}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-8 text-gray-400">
          A quiet digital place to remember — preserved with care and privacy.
        </p>
        {pinProtected ? (
          <p className="mt-6 text-xs text-gray-500">
            Unlocked with PIN for this device session.
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
        <h2 className="font-sans text-2xl font-medium tracking-tight text-[#F5F1E8]">
          Memories
        </h2>
        {statements.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No statements have been added yet."
            description="When the family is ready, words of remembrance will appear here."
          />
        ) : (
          <ul className="mt-8 space-y-6">
            {statements.map((item) => (
              <li
                key={item.id}
                className="border-l border-gold/40 pl-5 text-base leading-8 text-[#F5F1E8]"
              >
                {item.body}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8 sm:py-10">
        <h2 className="font-sans text-2xl font-medium tracking-tight text-[#F5F1E8]">
          Photographs & media
        </h2>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          Media opens through short-lived secure links. Nothing is stored as a
          permanent public URL.
        </p>

        {!r2Configured && media.length > 0 ? (
          <Alert tone="warning" className="mt-6">
            Media playback is paused while storage is reconnecting. Metadata
            still shows what the family uploaded.
          </Alert>
        ) : null}

        {media.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No photographs have been added yet."
            description="When memories are ready, photos, video, and voice will appear here."
          />
        ) : (
          <div className="mt-8 space-y-6">
            {photos.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {photos.map((item) => (
                  <MemorialMediaItem
                    key={item.id}
                    item={item}
                    enabled={r2Configured}
                    presentation="gallery"
                  />
                ))}
              </ul>
            ) : null}
            {videos.length > 0 || voices.length > 0 ? (
              <ul className="overflow-hidden rounded-xl border border-[#2A2E33]">
                {[...videos, ...voices].map((item) => (
                  <MemorialMediaItem
                    key={item.id}
                    item={item}
                    enabled={r2Configured}
                    presentation="list"
                  />
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </section>

      <MemorialComments
        qrId={qrId}
        packageTier={packageTier}
        initialComments={comments.map((item) => ({
          ...item,
          createdAt: item.createdAt,
        }))}
        used={commentQuota.used}
        max={commentQuota.max}
        nextMaxWords={commentQuota.nextMaxWords}
      />

      <p className="px-2 pb-4 text-center text-xs leading-6 text-gray-500">
        Family memories are private. Temple administrators cannot view
        statements, media, or comments.
      </p>
    </div>
  );
}
