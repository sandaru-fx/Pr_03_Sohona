import { notFound } from "next/navigation";
import { MemorialView } from "@/components/public/MemorialView";

export default function MemorialPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <MemorialView displayName="Sumathi" qrId="design-preview" packageId="" statements={[
    { id: "preview-story", sortOrder: 0, body: "Some lives leave a little more light in the world. This is a place to keep those moments close — the stories shared around a table, the laughter in familiar rooms, and the kindness that lives on in each of us." },
    { id: "preview-story-2", sortOrder: 1, body: "May the generations who come after us find a connection here: a voice, a memory, a small glimpse of a life deeply loved." },
  ]} media={[]} comments={[]} commentQuota={{ used: 0, max: 0, nextMaxWords: null }} pinProtected={false} r2Configured={false} />;
}
