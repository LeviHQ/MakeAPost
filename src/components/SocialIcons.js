'use client';

/**
 * Official Vector Brand Icons for X (Twitter), LinkedIn, and Reddit
 * Scalable SVG components with Neobrutalist design compatibility.
 */

export function XIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="X (Twitter) Icon"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="LinkedIn Icon"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

export function RedditIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Reddit Icon"
    >
      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm5.01 4.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25zm-1.8 1.94a2.24 2.24 0 0 0-1.92 1.09c-1.39-.23-2.93-.34-4.29-.34-.36 0-.71.01-1.06.03l.79-2.5 2.15.51a1.25 1.25 0 1 0 1.21-.93l-2.61-.62a.47.47 0 0 0-.56.32l-1 3.19c-.31.04-.61.08-.91.13a2.23 2.23 0 0 0-3.6 1.76 2.2 2.2 0 0 0 .59 1.5 4.54 4.54 0 0 0-.09.91c0 2.57 3.01 4.65 6.72 4.65s6.72-2.08 6.72-4.65a4.54 4.54 0 0 0-.09-.91 2.2 2.2 0 0 0 .59-1.5 2.23 2.23 0 0 0-2.25-2.24zm-6.21 4.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4.5 3.38a3.79 3.79 0 0 1-2.5.75 3.79 3.79 0 0 1-2.5-.75.38.38 0 0 1 .53-.54c.48.47 1.2.73 1.97.73s1.49-.26 1.97-.73a.38.38 0 0 1 .53.54zm.5-2.38a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  );
}
