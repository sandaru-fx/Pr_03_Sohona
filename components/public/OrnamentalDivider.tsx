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
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {label && (
        <h2 className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.3em] text-[#E0C088] text-center drop-shadow-md">
          {label}
        </h2>
      )}
      
      <div className="flex items-center w-full max-w-sm">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C67139]/30 to-[#C69F59]/80" />
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-[#E0C088] mx-3 drop-shadow-[0_0_8px_rgba(224,192,136,0.6)]"
        >
          <path
            d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z"
            fill="currentColor"
          />
        </svg>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C67139]/30 to-[#C69F59]/80" />
      </div>
    </div>
  );
}
