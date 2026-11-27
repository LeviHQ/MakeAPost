import Link from 'next/link';

export default function Logo({ size = 36, showWordmark = true, className = '', onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'inherit',
      }}
      className={className}
    >
      {/* Official MakeAPost Neobrutalist SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MakeAPost Logo"
        style={{ flexShrink: 0 }}
      >
        <rect x="6" y="6" width="34" height="34" rx="8" fill="#09090B" />
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="8"
          fill="#FFD93D"
          stroke="#09090B"
          strokeWidth="2.5"
        />
        <path
          d="M11 15V11H15M25 11H29V15M29 25V29H25M15 29H11V25"
          stroke="#09090B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 14L21.5 18.5L26 20L21.5 21.5L20 26L18.5 21.5L14 20L18.5 18.5L20 14Z"
          fill="#09090B"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: `${Math.max(18, Math.round(size * 0.58))}px`,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          Make<span style={{ color: '#09090B', backgroundColor: 'var(--accent-yellow)', padding: '1px 3px', borderRadius: '4px', border: '1.5px solid #09090B', margin: '0 1px' }}>A</span>Post
        </span>
      )}
    </Link>
  );
}
