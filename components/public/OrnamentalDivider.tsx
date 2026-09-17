/**
 * A decorative ornamental divider.
 * Matches the reference design: Text on top, long gold line with a diamond in the center below it.
 */
export function OrnamentalDivider({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} aria-hidden="true">
      {label && (
        <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.4em] text-gold">
          {label}
        </span>
      )}
      
      <div className="flex items-center w-full max-w-sm">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/15 to-gold/30" />
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          className="shrink-0 text-gold/60 mx-3"
        >
          <path
            d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z"
            fill="currentColor"
          />
        </svg>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/15 to-gold/30" />
      </div>
    </div>
  );
}
