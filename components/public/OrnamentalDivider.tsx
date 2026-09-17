/**
 * A decorative ornamental divider with a small diamond/lotus center
 * and fading gold lines on each side. Used between memorial sections.
 */
export function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 py-2 ${className}`}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-gold/40" />
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0 text-gold opacity-60"
      >
        <path
          d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z"
          fill="currentColor"
        />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/30 to-gold/40" />
    </div>
  );
}
