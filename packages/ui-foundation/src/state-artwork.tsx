type StateKind = 'empty' | 'search' | 'error' | 'success' | 'offline';

/** Theme-aware vector artwork: no raster background, and no unbounded animation. */
export const StateArtwork = ({
  kind,
  className,
}: {
  readonly kind: StateKind;
  readonly className?: string;
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
      style={{ color: 'var(--color-brand-default, var(--iden-accent))', maxWidth: '100%' }}
    >
      <ellipse cx="160" cy="166" rx="105" ry="17" fill="currentColor" opacity=".035" />
      <g stroke="currentColor" strokeWidth="1">
        <circle cx="160" cy="100" r="84" opacity=".1" />
        <circle cx="160" cy="100" r="65" opacity=".13" strokeDasharray="2 6" />
        <path d="M39 100h32m178 0h32M160 4v16m0 160v16" opacity=".25" />
      </g>
      <rect
        x="91"
        y="46"
        width="138"
        height="112"
        rx="16"
        fill="var(--iden-surface)"
        stroke="var(--iden-line)"
      />
      <path d="M91 74h138" stroke="var(--iden-line)" />
      <circle cx="107" cy="60" r="2.5" fill="currentColor" opacity=".8" />
      <circle cx="118" cy="60" r="2.5" fill="currentColor" opacity=".25" />
      <path d="M194 60h19" stroke="currentColor" strokeOpacity=".2" strokeLinecap="round" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'success' && <path d="m139 112 15 15 29-31" />}
        {kind === 'error' && (
          <>
            <path d="m143 95 34 34m0-34-34 34" />
            <circle cx="160" cy="112" r="29" strokeWidth="1" opacity=".2" />
          </>
        )}
        {kind === 'search' && (
          <>
            <circle cx="153" cy="107" r="18" />
            <path d="m166 120 19 19" />
          </>
        )}
        {kind === 'empty' && (
          <>
            <path d="M131 98h58m-58 14h40m-40 14h29" opacity=".4" />
            <path d="M184 123v14m-7-7h14" />
          </>
        )}
        {kind === 'offline' && (
          <>
            <path d="M133 107a39 39 0 0 1 54 0m-46 9a27 27 0 0 1 37 0m-30 9a16 16 0 0 1 21 0M136 90l48 48" />
            <circle cx="160" cy="136" r="1" />
          </>
        )}
      </g>
      <circle cx="239" cy="88" r="5" fill="currentColor" opacity=".5" />
      <circle cx="83" cy="132" r="3" fill="currentColor" opacity=".35" />
    </svg>
  );
};
