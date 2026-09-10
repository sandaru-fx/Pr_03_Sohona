import { MemorialComments } from "@/components/public/MemorialComments";
import { MemorialMediaItem } from "@/components/public/MemorialMediaItem";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
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
    <div className="w-full max-w-2xl space-y-8">
      <header className="rounded-2xl border border-border bg-surface px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="text-sm tracking-wide text-gold">In remembrance</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          {displayName}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-foreground-secondary">
          A quiet digital place to remember — preserved with care and privacy.
        </p>
        {pinProtected ? (
          <p className="mt-5 text-xs text-foreground-muted">
            Unlocked with PIN for this device session.
          </p>
        ) : null}
      </header>

      <Card>
        <h2 className="font-display text-2xl text-foreground">Memories</h2>
        {statements.length === 0 ? (
          <EmptyState
            className="mt-5"
            title="No statements have been added yet."
            description="When the family is ready, words of remembrance will appear here."
          />
        ) : (
          <ul className="mt-6 space-y-5">
            {statements.map((item) => (
              <li
                key={item.id}
                className="border-l border-gold/40 pl-4 text-sm leading-7 text-foreground-secondary"
              >
                <span className="text-foreground">{item.body}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-foreground">
          Photographs & media
        </h2>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">
          Media opens through short-lived secure links. Nothing is stored as a
          permanent public URL.
        </p>

        {!r2Configured && media.length > 0 ? (
          <Alert tone="warning" className="mt-5">
            Media playback is paused while storage is reconnecting. Metadata
            still shows what the family uploaded.
          </Alert>
        ) : null}

        {media.length === 0 ? (
          <EmptyState
            className="mt-5"
            title="No photographs have been added yet."
            description="When memories are ready, photos, video, and voice will appear here."
          />
        ) : (
          <div className="mt-6 space-y-6">
            {photos.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
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
              <ul className="overflow-hidden rounded-xl border border-border">
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
      </Card>

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

      <p className="px-1 text-center text-xs leading-5 text-foreground-muted">
        Family memories are private. Temple administrators cannot view
        statements, media, or comments.
      </p>
    </div>
  );
}
