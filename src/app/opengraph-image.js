import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MakeAPost — Turn raw screenshots into viral social posts in seconds';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          backgroundImage: 'radial-gradient(#CBD5E1 2px, transparent 2px)',
          backgroundSize: '24px 24px',
          padding: '48px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '4px solid #09090B',
            borderRadius: '20px',
            boxShadow: '10px 10px 0px #09090B',
            padding: '46px 64px',
            maxWidth: '1080px',
            textAlign: 'center',
          }}
        >
          {/* Logo Emblem & Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
            <div
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#09090B',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Make
              <span
                style={{
                  backgroundColor: '#FFD93D',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '3px solid #09090B',
                  margin: '0 4px',
                }}
              >
                A
              </span>
              Post
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#09090B',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              lineHeight: 1.15,
            }}
          >
            INCREASE REACH OF YOUR SCREENSHOTS
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '22px',
              fontWeight: 500,
              color: '#475569',
              maxWidth: '860px',
              lineHeight: 1.45,
              marginBottom: '28px',
            }}
          >
            Turn raw screenshots into viral social posts in seconds. 100% Client-Side Canvas Editor + Multimodal AI Social Generator.
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#FFD93D',
                border: '3px solid #09090B',
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '3px 3px 0px #09090B',
                color: '#09090B',
              }}
            >
              70% Visual Canvas Editor
            </div>
            <div
              style={{
                backgroundColor: '#38BDF8',
                border: '3px solid #09090B',
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '3px 3px 0px #09090B',
                color: '#09090B',
              }}
            >
              Multimodal Gemini AI
            </div>
            <div
              style={{
                backgroundColor: '#4ADE80',
                border: '3px solid #09090B',
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '3px 3px 0px #09090B',
                color: '#09090B',
              }}
            >
              100% Privacy-First
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
