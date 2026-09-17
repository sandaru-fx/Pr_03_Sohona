"use client";

/**
 * A softly glowing lotus flower SVG ornament for the memorial hero section.
 * Rendered in gold with a subtle pulsing glow animation.
 */
export function LotusOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow layer */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(220,184,113,0.25) 0%, transparent 70%)",
          animation: "lotus-glow 3s ease-in-out infinite alternate",
        }}
      />
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-hidden="true"
      >
        {/* Center petal (top) */}
        <path
          d="M32 8C32 8 28 20 28 28C28 32 30 34 32 34C34 34 36 32 36 28C36 20 32 8 32 8Z"
          fill="url(#lotus-grad)"
          opacity="0.9"
        />
        {/* Left petals */}
        <path
          d="M20 18C20 18 22 30 26 34C28 36 30 35 30 33C30 31 26 22 20 18Z"
          fill="url(#lotus-grad)"
          opacity="0.7"
        />
        <path
          d="M12 28C12 28 18 36 24 38C27 39 28 37 27 35C26 33 18 28 12 28Z"
          fill="url(#lotus-grad)"
          opacity="0.5"
        />
        {/* Right petals */}
        <path
          d="M44 18C44 18 42 30 38 34C36 36 34 35 34 33C34 31 38 22 44 18Z"
          fill="url(#lotus-grad)"
          opacity="0.7"
        />
        <path
          d="M52 28C52 28 46 36 40 38C37 39 36 37 37 35C38 33 46 28 52 28Z"
          fill="url(#lotus-grad)"
          opacity="0.5"
        />
        {/* Base / water line */}
        <path
          d="M18 42C18 42 24 38 32 38C40 38 46 42 46 42C46 42 40 44 32 44C24 44 18 42 18 42Z"
          fill="url(#lotus-grad)"
          opacity="0.4"
        />
        {/* Center dot */}
        <circle cx="32" cy="30" r="2.5" fill="#dcb871" opacity="0.9" />
        <defs>
          <linearGradient id="lotus-grad" x1="32" y1="8" x2="32" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e5c586" />
            <stop offset="100%" stopColor="#b8943f" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
